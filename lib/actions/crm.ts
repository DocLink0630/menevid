"use server";

import { z } from "zod";
import {
  PropertyType,
  ListingPurpose,
  InquiryStatus,
} from "@prisma/client";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActivityActions } from "@/lib/constants/activity";
import { logActivity } from "@/lib/actions/reports";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const ownerListingSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  propertyName: z.string().optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  purpose: z.nativeEnum(ListingPurpose).optional(),
  bedrooms: z.coerce.number().int().optional(),
  squareFootage: z.coerce.number().optional(),
  unitNumber: z.string().optional(),
  askingPrice: z.coerce.number().optional(),
  monthlyRent: z.coerce.number().optional(),
  isAgentAppointed: z.boolean().optional(),
  remarks: z.string().optional(),
});

const inquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  propertyId: z.string().optional(),
  remarks: z.string().optional(),
  status: z.nativeEnum(InquiryStatus).optional(),
});

const emailSchema = z.object({
  toEmail: z.string().email(),
  toName: z.string().optional(),
  subject: z.string().min(1),
  body: z.string().min(1),
  entityType: z.enum(["inquiry", "ownerListing"]),
  entityId: z.string(),
});

export async function createOwnerListing(
  data: z.infer<typeof ownerListingSchema>,
) {
  const parsed = ownerListingSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const listing = await prisma.ownerListing.create({
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      propertyName: parsed.data.propertyName || null,
      propertyType: parsed.data.propertyType ?? null,
      purpose: parsed.data.purpose ?? null,
      bedrooms: parsed.data.bedrooms ?? null,
      squareFootage: parsed.data.squareFootage ?? null,
      unitNumber: parsed.data.unitNumber || null,
      askingPrice: parsed.data.askingPrice ?? null,
      monthlyRent: parsed.data.monthlyRent ?? null,
      isAgentAppointed: parsed.data.isAgentAppointed ?? false,
      remarks: parsed.data.remarks || null,
    },
  });

  await logActivity(
    user.id,
    ActivityActions.OWNER_LISTING_CREATED,
    "OwnerListing",
    listing.id,
  );
  revalidatePath("/crm/owner-listings");
  return { success: true as const, data: { id: listing.id } };
}

export async function updateOwnerListing(
  id: string,
  data: z.infer<typeof ownerListingSchema>,
) {
  const parsed = ownerListingSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.ownerListing.update({
    where: { id },
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      propertyName: parsed.data.propertyName || null,
      propertyType: parsed.data.propertyType ?? null,
      purpose: parsed.data.purpose ?? null,
      bedrooms: parsed.data.bedrooms ?? null,
      squareFootage: parsed.data.squareFootage ?? null,
      unitNumber: parsed.data.unitNumber || null,
      askingPrice: parsed.data.askingPrice ?? null,
      monthlyRent: parsed.data.monthlyRent ?? null,
      isAgentAppointed: parsed.data.isAgentAppointed ?? false,
      remarks: parsed.data.remarks || null,
    },
  });

  revalidatePath("/crm/owner-listings");
  revalidatePath(`/crm/owner-listings/${id}`);
  return { success: true as const };
}

export async function getOwnerListings(params: {
  purpose?: string;
  propertyType?: string;
  isConverted?: string;
  isAgentAppointed?: string;
  page?: number;
}) {
  const page = params.page ?? 1;
  const perPage = 25;
  const where: Record<string, unknown> = {};

  if (params.purpose && params.purpose !== "all") where.purpose = params.purpose;
  if (params.propertyType && params.propertyType !== "all")
    where.propertyType = params.propertyType;
  if (params.isConverted === "true") where.isConverted = true;
  if (params.isConverted === "false") where.isConverted = false;
  if (params.isAgentAppointed === "true") where.isAgentAppointed = true;
  if (params.isAgentAppointed === "false") where.isAgentAppointed = false;

  const [listings, total] = await Promise.all([
    prisma.ownerListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.ownerListing.count({ where }),
  ]);

  return {
    listings: listings.map((l) => ({
      ...l,
      squareFootage: l.squareFootage ? Number(l.squareFootage) : null,
      askingPrice: l.askingPrice ? Number(l.askingPrice) : null,
      monthlyRent: l.monthlyRent ? Number(l.monthlyRent) : null,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

export async function getOwnerListing(id: string) {
  const listing = await prisma.ownerListing.findUnique({ where: { id } });
  if (!listing) return null;

  const emails = await prisma.emailLog.findMany({
    where: { ownerListingId: id },
    orderBy: { sentAt: "desc" },
  });

  return {
    ...listing,
    squareFootage: listing.squareFootage ? Number(listing.squareFootage) : null,
    askingPrice: listing.askingPrice ? Number(listing.askingPrice) : null,
    monthlyRent: listing.monthlyRent ? Number(listing.monthlyRent) : null,
    emails,
  };
}

export async function createInquiry(data: z.infer<typeof inquirySchema>) {
  const parsed = inquirySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const inquiry = await prisma.inquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      propertyId: parsed.data.propertyId || null,
      remarks: parsed.data.remarks || null,
      status: parsed.data.status ?? "NEW",
    },
  });

  await logActivity(
    user.id,
    ActivityActions.INQUIRY_CREATED,
    "Inquiry",
    inquiry.id,
  );
  revalidatePath("/crm/inquiries");
  return { success: true as const, data: { id: inquiry.id } };
}

export async function updateInquiry(
  id: string,
  data: z.infer<typeof inquirySchema>,
) {
  const parsed = inquirySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const existing = await prisma.inquiry.findUnique({ where: { id } });
  if (!existing) return { error: "Inquiry not found" };

  await prisma.inquiry.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      propertyId: parsed.data.propertyId || null,
      remarks: parsed.data.remarks || null,
      status: parsed.data.status ?? existing.status,
    },
  });

  if (parsed.data.status && parsed.data.status !== existing.status) {
    await logActivity(
      user.id,
      ActivityActions.INQUIRY_STATUS_CHANGED,
      "Inquiry",
      id,
      { status: parsed.data.status },
    );
  }

  revalidatePath("/crm/inquiries");
  revalidatePath(`/crm/inquiries/${id}`);
  return { success: true as const };
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.inquiry.update({
    where: { id },
    data: { status },
  });

  await logActivity(
    user.id,
    ActivityActions.INQUIRY_STATUS_CHANGED,
    "Inquiry",
    id,
    { status },
  );

  revalidatePath("/crm/inquiries");
  revalidatePath(`/crm/inquiries/${id}`);
  return { success: true as const };
}

export async function getInquiries(params: {
  status?: string;
  propertyId?: string;
  page?: number;
}) {
  const page = params.page ?? 1;
  const perPage = 25;
  const where: Record<string, unknown> = {};

  if (params.status && params.status !== "all") where.status = params.status;
  if (params.propertyId && params.propertyId !== "all")
    where.propertyId = params.propertyId;

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      include: { property: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.inquiry.count({ where }),
  ]);

  return {
    inquiries,
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

export async function getInquiry(id: string) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { property: true },
  });
  if (!inquiry) return null;

  const emails = await prisma.emailLog.findMany({
    where: { inquiryId: id },
    orderBy: { sentAt: "desc" },
  });

  return { ...inquiry, emails };
}

export async function sendEmail(data: z.infer<typeof emailSchema>) {
  const parsed = emailSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const { error } = await getResend().emails.send({
      from: "Menavid Realtors <noreply@menavid.lk>",
      to: parsed.data.toEmail,
      subject: parsed.data.subject,
      text: parsed.data.body,
    });

    if (error) {
      return { error: error.message };
    }

    await prisma.emailLog.create({
      data: {
        toEmail: parsed.data.toEmail,
        toName: parsed.data.toName || null,
        subject: parsed.data.subject,
        body: parsed.data.body,
        inquiryId:
          parsed.data.entityType === "inquiry" ? parsed.data.entityId : null,
        ownerListingId:
          parsed.data.entityType === "ownerListing"
            ? parsed.data.entityId
            : null,
      },
    });

    await logActivity(user.id, ActivityActions.EMAIL_SENT, parsed.data.entityType, parsed.data.entityId);

    revalidatePath(`/crm/${parsed.data.entityType === "inquiry" ? "inquiries" : "owner-listings"}/${parsed.data.entityId}`);
    return { success: true as const };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to send email",
    };
  }
}
