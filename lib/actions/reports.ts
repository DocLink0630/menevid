"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function logActivity(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  meta?: Prisma.InputJsonValue,
) {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      meta,
    },
  });
}

export async function getPortfolioSummary() {
  const [
    totalProperties,
    currentlyRented,
    available,
    temporarilyUnavailable,
    listedForSale,
    totalActiveLeases,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "RENTED" } }),
    prisma.property.count({ where: { status: "AVAILABLE" } }),
    prisma.property.count({ where: { status: "TEMPORARILY_UNAVAILABLE" } }),
    prisma.property.count({
      where: {
        OR: [{ purpose: "SALE" }, { purpose: "RENT_AND_SALE" }],
        status: { not: "SOLD" },
      },
    }),
    prisma.lease.count({ where: { status: "ACTIVE" } }),
  ]);

  return {
    totalProperties,
    currentlyRented,
    available,
    temporarilyUnavailable,
    listedForSale,
    totalActiveLeases,
  };
}

export async function getUpcomingRenewals() {
  const today = new Date();
  const in60Days = new Date();
  in60Days.setDate(in60Days.getDate() + 60);

  const leases = await prisma.lease.findMany({
    where: {
      status: "ACTIVE",
      endDate: { lte: in60Days },
    },
    include: { property: true },
    orderBy: { endDate: "asc" },
  });

  return leases.map((lease) => ({
    id: lease.id,
    propertyName: lease.property.name,
    unitNumber: lease.property.unitNumber,
    tenantName: lease.tenantName,
    endDate: lease.endDate,
    rentAmount: Number(lease.rentAmount),
  }));
}

export async function getOverduePayments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const payments = await prisma.rentPayment.findMany({
    where: {
      isPaid: false,
      dueDate: { lt: today },
    },
    include: {
      lease: { include: { property: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return payments.map((payment) => ({
    id: payment.id,
    leaseId: payment.leaseId,
    propertyName: payment.lease.property.name,
    unitNumber: payment.lease.property.unitNumber,
    tenantName: payment.lease.tenantName,
    dueDate: payment.dueDate,
    amount: Number(payment.amount),
  }));
}

export async function getRecentActivity(limit = 50) {
  const logs = await prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    userName: log.user?.name ?? log.user?.email ?? "System",
    createdAt: log.createdAt,
  }));
}
