"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const createOwnerSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

/** Merge Owners that share the same fullName (case-insensitive). Keeps oldest. */
async function consolidateOwnersByFullName(fullName: string) {
  const name = fullName.trim();
  if (!name) return null;

  const duplicates = await prisma.owner.findMany({
    where: { fullName: { equals: name, mode: "insensitive" } },
    orderBy: { createdAt: "asc" },
    include: { properties: true },
  });

  if (duplicates.length <= 1) return duplicates[0] ?? null;

  const [keeper, ...extras] = duplicates;
  const keeperPropertyIds = new Set(keeper.properties.map((p) => p.propertyId));

  for (const dup of extras) {
    for (const ownership of dup.properties) {
      if (keeperPropertyIds.has(ownership.propertyId)) {
        await prisma.propertyOwnership.delete({ where: { id: ownership.id } });
        continue;
      }
      await prisma.propertyOwnership.update({
        where: { id: ownership.id },
        data: { ownerId: keeper.id },
      });
      keeperPropertyIds.add(ownership.propertyId);
    }
    await prisma.owner.delete({ where: { id: dup.id } });
  }

  return keeper;
}

async function findExistingOwner(contact: {
  fullName: string;
  phone?: string | null;
  email?: string | null;
}) {
  const fullName = contact.fullName.trim();
  const phone = contact.phone?.trim() || null;
  const email = contact.email?.trim() || null;

  if (phone) {
    const byPhone = await prisma.owner.findFirst({ where: { phone } });
    if (byPhone) return byPhone;
  }

  if (email) {
    const byEmail = await prisma.owner.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (byEmail) return byEmail;
  }

  if (fullName) {
    return prisma.owner.findFirst({
      where: { fullName: { equals: fullName, mode: "insensitive" } },
      orderBy: { createdAt: "asc" },
    });
  }

  return null;
}

export async function createOwner(data: z.infer<typeof createOwnerSchema>) {
  const parsed = createOwnerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const fullName = parsed.data.fullName.trim();
  const phone = parsed.data.phone?.trim() || null;
  const email = parsed.data.email?.trim() || null;

  await consolidateOwnersByFullName(fullName);

  const existing = await findExistingOwner({ fullName, phone, email });
  if (existing) {
    return {
      success: true as const,
      data: {
        id: existing.id,
        fullName: existing.fullName,
        phone: existing.phone,
        email: existing.email,
      },
    };
  }

  const owner = await prisma.owner.create({
    data: { fullName, phone, email },
  });

  return {
    success: true as const,
    data: {
      id: owner.id,
      fullName: owner.fullName,
      phone: owner.phone,
      email: owner.email,
    },
  };
}

export async function searchOwners(query: string) {
  if (!query || query.length < 1) return { success: true as const, data: [] };

  let owners = await prisma.owner.findMany({
    where: {
      fullName: { contains: query, mode: "insensitive" },
    },
    take: 10,
    orderBy: { fullName: "asc" },
  });

  const nameCounts = new Map<string, number>();
  for (const o of owners) {
    const key = o.fullName.toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
  }

  const namesToConsolidate = owners
    .filter((o) => (nameCounts.get(o.fullName.toLowerCase()) ?? 0) > 1)
    .map((o) => o.fullName);

  if (namesToConsolidate.length > 0) {
    const seen = new Set<string>();
    for (const o of owners) {
      const key = o.fullName.toLowerCase();
      if ((nameCounts.get(key) ?? 0) > 1 && !seen.has(key)) {
        seen.add(key);
        await consolidateOwnersByFullName(o.fullName);
      }
    }

    owners = await prisma.owner.findMany({
      where: {
        fullName: { contains: query, mode: "insensitive" },
      },
      take: 10,
      orderBy: { fullName: "asc" },
    });
  }

  return {
    success: true as const,
    data: owners.map((o) => ({
      id: o.id,
      fullName: o.fullName,
      phone: o.phone,
      email: o.email,
    })),
  };
}

/** Find or create a portfolio Owner from an owner-listing contact (convert flow). */
export async function ensureOwnerFromListing(contact: {
  fullName: string;
  phone?: string | null;
  email?: string | null;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" as const };

  const fullName = contact.fullName.trim();
  if (!fullName) return { error: "Name is required" as const };

  const phone = contact.phone?.trim() || null;
  const email = contact.email?.trim() || null;

  await consolidateOwnersByFullName(fullName);

  const existing = await findExistingOwner({ fullName, phone, email });
  if (existing) {
    return {
      success: true as const,
      data: { id: existing.id, fullName: existing.fullName },
    };
  }

  const owner = await prisma.owner.create({
    data: { fullName, phone, email },
  });

  return {
    success: true as const,
    data: { id: owner.id, fullName: owner.fullName },
  };
}
