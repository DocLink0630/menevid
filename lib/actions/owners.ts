"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const createOwnerSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function createOwner(data: z.infer<typeof createOwnerSchema>) {
  const parsed = createOwnerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const owner = await prisma.owner.create({
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
    },
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

  const owners = await prisma.owner.findMany({
    where: {
      fullName: { contains: query, mode: "insensitive" },
    },
    take: 10,
    orderBy: { fullName: "asc" },
  });

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
