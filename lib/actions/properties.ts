"use server";

import { z } from "zod";
import {
  PropertyType,
  ListingPurpose,
  PropertyStatus,
  FurnishingStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActivityActions } from "@/lib/constants/activity";
import { logActivity } from "@/lib/actions/reports";
import { createNewListingReminder } from "@/lib/utils/reminder-engine";

const ownerInputSchema = z.object({
  ownerId: z.string(),
  isPrimary: z.boolean(),
});

const propertySchema = z
  .object({
    name: z.string().min(1, "Property name is required"),
    unitNumber: z.string().optional(),
    type: z.nativeEnum(PropertyType),
    purpose: z.nativeEnum(ListingPurpose),
    squareFootage: z.number().optional(),
    bedrooms: z.number().int().optional(),
    furnishing: z.nativeEnum(FurnishingStatus).optional(),
    monthlyRent: z.number().optional(),
    salePrice: z.number().optional(),
    status: z.nativeEnum(PropertyStatus),
    temporaryUnavailableUntil: z.string().optional(),
    availableFrom: z.string().optional(),
    notes: z.string().optional(),
    owners: z.array(ownerInputSchema).min(1, "At least one owner is required"),
    fromListingId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "HOUSE" && data.squareFootage == null) {
      ctx.addIssue({
        code: "custom",
        message: "Size of the land is required for houses",
        path: ["squareFootage"],
      });
    }
    if (
      (data.purpose === "RENT" || data.purpose === "RENT_AND_SALE") &&
      data.monthlyRent == null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Monthly rent is required for rental listings",
        path: ["monthlyRent"],
      });
    }
    if (
      (data.purpose === "SALE" || data.purpose === "RENT_AND_SALE") &&
      data.salePrice == null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Sale price is required for sale listings",
        path: ["salePrice"],
      });
    }
    if (
      data.status === "TEMPORARILY_UNAVAILABLE" &&
      !data.temporaryUnavailableUntil
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Unavailable until date is required",
        path: ["temporaryUnavailableUntil"],
      });
    }
  });

export type PropertyFormData = z.infer<typeof propertySchema>;

function parseDate(value?: string) {
  return value ? new Date(value) : null;
}

function serializeProperty(property: {
  id: string;
  name: string;
  unitNumber: string | null;
  type: PropertyType;
  purpose: ListingPurpose;
  squareFootage: { toNumber?: () => number } | null;
  bedrooms: number | null;
  furnishing: FurnishingStatus | null;
  monthlyRent: { toNumber?: () => number } | null;
  salePrice: { toNumber?: () => number } | null;
  status: PropertyStatus;
  temporaryUnavailableUntil: Date | null;
  availableFrom: Date | null;
  notes: string | null;
}) {
  return {
    ...property,
    squareFootage: property.squareFootage ? Number(property.squareFootage) : null,
    monthlyRent: property.monthlyRent ? Number(property.monthlyRent) : null,
    salePrice: property.salePrice ? Number(property.salePrice) : null,
  };
}

export async function createProperty(data: PropertyFormData) {
  const parsed = propertySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const d = parsed.data;
  const hasPrimary = d.owners.some((o) => o.isPrimary);
  const owners = hasPrimary
    ? d.owners
    : d.owners.map((o, i) => ({ ...o, isPrimary: i === 0 }));

  const property = await prisma.$transaction(async (tx) => {
    const created = await tx.property.create({
      data: {
        name: d.name,
        unitNumber: d.unitNumber || null,
        type: d.type,
        purpose: d.purpose,
        squareFootage: d.squareFootage ?? null,
        bedrooms: d.bedrooms ?? null,
        furnishing: d.furnishing ?? null,
        monthlyRent: d.monthlyRent ?? null,
        salePrice: d.salePrice ?? null,
        status: d.status,
        temporaryUnavailableUntil: parseDate(d.temporaryUnavailableUntil),
        availableFrom: parseDate(d.availableFrom),
        notes: d.notes || null,
        owners: {
          create: owners.map((o) => ({
            ownerId: o.ownerId,
            isPrimary: o.isPrimary,
          })),
        },
      },
    });

    await tx.propertyStatusLog.create({
      data: {
        propertyId: created.id,
        status: d.status,
        note: "Initial status",
      },
    });

    if (d.fromListingId) {
      await tx.ownerListing.update({
        where: { id: d.fromListingId },
        data: {
          isConverted: true,
          convertedPropertyId: created.id,
        },
      });
    }

    await createNewListingReminder(
      {
        id: created.id,
        name: created.name,
        unitNumber: created.unitNumber,
      },
      user.id,
      tx,
    );

    return created;
  });

  await logActivity(
    user.id,
    d.fromListingId
      ? ActivityActions.OWNER_LISTING_CONVERTED
      : ActivityActions.PROPERTY_CREATED,
    "Property",
    property.id,
  );

  revalidatePath("/properties");
  revalidatePath("/crm/owner-listings");
  revalidatePath("/reports");
  revalidatePath("/reminders");
  return { success: true as const, data: { id: property.id } };
}

export async function updateProperty(id: string, data: PropertyFormData) {
  const parsed = propertySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const d = parsed.data;
  const hasPrimary = d.owners.some((o) => o.isPrimary);
  const owners = hasPrimary
    ? d.owners
    : d.owners.map((o, i) => ({ ...o, isPrimary: i === 0 }));

  await prisma.$transaction(async (tx) => {
    await tx.propertyOwnership.deleteMany({ where: { propertyId: id } });
    await tx.property.update({
      where: { id },
      data: {
        name: d.name,
        unitNumber: d.unitNumber || null,
        type: d.type,
        purpose: d.purpose,
        squareFootage: d.squareFootage ?? null,
        bedrooms: d.bedrooms ?? null,
        furnishing: d.furnishing ?? null,
        monthlyRent: d.monthlyRent ?? null,
        salePrice: d.salePrice ?? null,
        status: d.status,
        temporaryUnavailableUntil: parseDate(d.temporaryUnavailableUntil),
        availableFrom: parseDate(d.availableFrom),
        notes: d.notes || null,
        owners: {
          create: owners.map((o) => ({
            ownerId: o.ownerId,
            isPrimary: o.isPrimary,
          })),
        },
      },
    });
  });

  await logActivity(user.id, ActivityActions.PROPERTY_UPDATED, "Property", id);
  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);
  return { success: true as const };
}

const statusSchema = z
  .object({
    status: z.nativeEnum(PropertyStatus),
    note: z.string().optional(),
    unavailableUntil: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === "TEMPORARILY_UNAVAILABLE" &&
      !data.unavailableUntil
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Unavailable until date is required",
        path: ["unavailableUntil"],
      });
    }
  });

export async function updatePropertyStatus(
  id: string,
  status: PropertyStatus,
  note?: string,
  unavailableUntil?: string,
) {
  const parsed = statusSchema.safeParse({ status, note, unavailableUntil });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.$transaction(async (tx) => {
    await tx.property.update({
      where: { id },
      data: {
        status: parsed.data.status,
        temporaryUnavailableUntil:
          parsed.data.status === "TEMPORARILY_UNAVAILABLE"
            ? parseDate(parsed.data.unavailableUntil)
            : null,
      },
    });
    await tx.propertyStatusLog.create({
      data: {
        propertyId: id,
        status: parsed.data.status,
        note: parsed.data.note || null,
      },
    });
  });

  await logActivity(
    user.id,
    ActivityActions.PROPERTY_STATUS_CHANGED,
    "Property",
    id,
    { status: parsed.data.status },
  );

  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);
  revalidatePath("/reports");
  return { success: true as const };
}

export async function deleteProperty(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const activeLease = await prisma.lease.findFirst({
    where: { propertyId: id, status: "ACTIVE" },
  });
  if (activeLease) {
    return { error: "Cannot delete property with an active lease" };
  }

  await prisma.property.delete({ where: { id } });
  await logActivity(user.id, ActivityActions.PROPERTY_DELETED, "Property", id);

  revalidatePath("/properties");
  revalidatePath("/reports");
  revalidatePath("/reminders");
  return { success: true as const };
}

export async function getProperties(params: {
  status?: string;
  type?: string;
  purpose?: string;
  q?: string;
  page?: number;
}) {
  const page = params.page ?? 1;
  const perPage = 25;
  const where: Record<string, unknown> = {};

  if (params.status && params.status !== "all") {
    where.status = params.status;
  }
  if (params.type && params.type !== "all") {
    where.type = params.type;
  }
  if (params.purpose && params.purpose !== "all") {
    where.purpose = params.purpose;
  }
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { unitNumber: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        owners: { include: { owner: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties: properties.map((p) => ({
      ...serializeProperty(p),
      owners: p.owners.map((o) => ({
        id: o.owner.id,
        fullName: o.owner.fullName,
        isPrimary: o.isPrimary,
      })),
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

export async function getProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      owners: { include: { owner: true } },
      statusLogs: { orderBy: { changedAt: "desc" } },
      leases: {
        include: { payments: true },
        orderBy: { startDate: "desc" },
      },
      inquiries: { orderBy: { createdAt: "desc" } },
      reminders: {
        where: { status: { in: ["PENDING", "SENT"] } },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  if (!property) return null;

  return {
    ...serializeProperty(property),
    owners: property.owners.map((o) => ({
      ownerId: o.owner.id,
      fullName: o.owner.fullName,
      phone: o.owner.phone,
      email: o.owner.email,
      isPrimary: o.isPrimary,
    })),
    statusLogs: property.statusLogs,
    leases: property.leases.map((l) => ({
      ...l,
      rentAmount: Number(l.rentAmount),
      depositAmount: l.depositAmount ? Number(l.depositAmount) : null,
    })),
    inquiries: property.inquiries,
    reminders: property.reminders,
  };
}

export async function getOwnerListingForConvert(id: string) {
  const listing = await prisma.ownerListing.findUnique({ where: { id } });
  if (!listing) return null;
  return {
    ...listing,
    squareFootage: listing.squareFootage
      ? Number(listing.squareFootage)
      : null,
    askingPrice: listing.askingPrice ? Number(listing.askingPrice) : null,
    monthlyRent: listing.monthlyRent ? Number(listing.monthlyRent) : null,
  };
}

export async function searchProperties(query: string) {
  const properties = await prisma.property.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
    },
    take: 10,
    orderBy: { name: "asc" },
  });
  return properties.map((p) => ({
    id: p.id,
    name: p.name,
    unitNumber: p.unitNumber,
  }));
}

export async function getAvailablePropertiesForLease() {
  const properties = await prisma.property.findMany({
    where: {
      leases: { none: { status: "ACTIVE" } },
    },
    orderBy: { name: "asc" },
  });
  return properties.map((p) => ({
    id: p.id,
    name: p.name,
    unitNumber: p.unitNumber,
  }));
}
