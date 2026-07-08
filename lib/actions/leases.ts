"use server";

import { z } from "zod";
import { LeaseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActivityActions } from "@/lib/constants/activity";
import { logActivity } from "@/lib/actions/reports";
import {
  generatePaymentSchedule,
  generateLeaseReminders,
} from "@/lib/utils/reminder-engine";
import { encodePaymentDue } from "@/lib/utils/payment-frequency";
import { differenceInCalendarMonths } from "date-fns";

const leaseSchema = z.object({
  propertyId: z.string().min(1),
  tenantName: z.string().min(1),
  tenantPhone: z.string().optional(),
  tenantEmail: z.string().optional(),
  tenantNic: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  rentAmount: z.coerce.number().positive(),
  depositAmount: z.coerce.number().optional(),
  /** Day of month 1-28 */
  paymentDueDay: z.coerce.number().int().min(1).max(28),
  /** Payment interval in months: 1, 3, 4, 6, 12 */
  paymentFrequencyMonths: z.coerce
    .number()
    .refine((v) => [1, 3, 4, 6, 12].includes(v), {
      message: "Invalid payment frequency",
    })
    .default(1),
});

const renewSchema = z.object({
  newEndDate: z.string().min(1),
  newRentAmount: z.number().positive(),
  note: z.string().optional(),
});

const refundSchema = z.object({
  refundDate: z.string().min(1),
  note: z.string().optional(),
});

function monthsBetween(start: Date, end: Date) {
  return differenceInCalendarMonths(end, start);
}

export async function createLease(data: z.infer<typeof leaseSchema>) {
  const parsed = leaseSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { error: "Invalid lease dates" };
  }

  if (endDate <= startDate) {
    return { error: "End date must be after start date" };
  }

  if (monthsBetween(startDate, endDate) < 6) {
    return { error: "Minimum lease duration is 6 months" };
  }

  const activeLease = await prisma.lease.findFirst({
    where: { propertyId: parsed.data.propertyId, status: "ACTIVE" },
  });
  if (activeLease) {
    return { error: "Property already has an active lease" };
  }

  const property = await prisma.property.findUnique({
    where: { id: parsed.data.propertyId },
  });
  if (!property) return { error: "Property not found" };

  const paymentDueDayEncoded = encodePaymentDue(
    parsed.data.paymentDueDay,
    parsed.data.paymentFrequencyMonths as 1 | 3 | 4 | 6 | 12,
  );

  try {
    const lease = await prisma.$transaction(async (tx) => {
      const created = await tx.lease.create({
        data: {
          propertyId: parsed.data.propertyId,
          tenantName: parsed.data.tenantName,
          tenantPhone: parsed.data.tenantPhone || null,
          tenantEmail: parsed.data.tenantEmail || null,
          tenantNic: parsed.data.tenantNic || null,
          startDate,
          endDate,
          rentAmount: parsed.data.rentAmount,
          depositAmount: parsed.data.depositAmount ?? null,
          paymentDueDay: paymentDueDayEncoded,
          status: "ACTIVE",
        },
      });

      await tx.property.update({
        where: { id: parsed.data.propertyId },
        data: { status: "RENTED" },
      });

      await tx.propertyStatusLog.create({
        data: {
          propertyId: parsed.data.propertyId,
          status: "RENTED",
          note: `Lease created for ${parsed.data.tenantName}`,
        },
      });

      const payments = await generatePaymentSchedule(created, tx);
      await generateLeaseReminders(
        created,
        property.name,
        user.id,
        tx,
        payments,
      );

      return created;
    });

    await logActivity(user.id, ActivityActions.LEASE_CREATED, "Lease", lease.id);
    revalidatePath("/leases");
    revalidatePath("/properties");
    revalidatePath("/reminders");
    return { success: true as const, data: { id: lease.id } };
  } catch (err) {
    console.error("createLease failed", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Failed to create lease. Please try again.",
    };
  }
}

export async function updateLease(
  id: string,
  data: Partial<z.infer<typeof leaseSchema>>,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const updateData: {
    tenantName?: string;
    tenantPhone?: string | null;
    tenantEmail?: string | null;
    tenantNic?: string | null;
    depositAmount?: number;
    paymentDueDay?: number;
  } = {
    tenantName: data.tenantName,
    tenantPhone: data.tenantPhone || null,
    tenantEmail: data.tenantEmail || null,
    tenantNic: data.tenantNic || null,
    depositAmount: data.depositAmount ?? undefined,
  };

  if (data.paymentDueDay != null) {
    const freq =
      (data.paymentFrequencyMonths as 1 | 3 | 4 | 6 | 12 | undefined) ?? 1;
    updateData.paymentDueDay = encodePaymentDue(data.paymentDueDay, freq);
  }

  await prisma.lease.update({
    where: { id },
    data: updateData,
  });

  revalidatePath(`/leases/${id}`);
  return { success: true as const };
}

export async function renewLease(
  id: string,
  data: z.infer<typeof renewSchema>,
) {
  const parsed = renewSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const lease = await prisma.lease.findUnique({
    where: { id },
    include: { property: true },
  });
  if (!lease) return { error: "Lease not found" };

  const newEndDate = new Date(parsed.data.newEndDate);
  if (newEndDate <= lease.endDate) {
    return { error: "New end date must be after current end date" };
  }

  const oldEndDate = lease.endDate;

  await prisma.$transaction(async (tx) => {
    const rentChanged =
      Number(lease.rentAmount) !== parsed.data.newRentAmount;

    if (rentChanged) {
      await tx.rentRevision.create({
        data: {
          leaseId: id,
          previousRent: lease.rentAmount,
          newRent: parsed.data.newRentAmount,
          effectiveDate: new Date(),
          note: parsed.data.note || null,
        },
      });
    }

    const updated = await tx.lease.update({
      where: { id },
      data: {
        endDate: newEndDate,
        rentAmount: parsed.data.newRentAmount,
      },
    });

    await generatePaymentSchedule(updated, tx, oldEndDate);

    await tx.reminder.updateMany({
      where: {
        leaseId: id,
        type: { in: ["RENEWAL_6_WEEKS", "RENEWAL_4_WEEKS"] },
        status: { in: ["PENDING", "SENT"] },
      },
      data: { status: "DISMISSED" },
    });

    await generateLeaseReminders(
      updated,
      lease.property.name,
      user.id,
      tx,
    );
  });

  await logActivity(user.id, ActivityActions.LEASE_RENEWED, "Lease", id);
  revalidatePath(`/leases/${id}`);
  revalidatePath("/leases");
  revalidatePath("/reminders");
  return { success: true as const };
}

export async function markPaymentPaid(paymentId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const payment = await prisma.rentPayment.findUnique({
    where: { id: paymentId },
    include: { lease: true },
  });
  if (!payment) return { error: "Payment not found" };

  await prisma.$transaction(async (tx) => {
    await tx.rentPayment.update({
      where: { id: paymentId },
      data: { isPaid: true, paidDate: new Date() },
    });

    await tx.reminder.updateMany({
      where: {
        leaseId: payment.leaseId,
        type: "PAYMENT_DUE",
        status: { in: ["PENDING", "SENT"] },
        dueDate: payment.dueDate,
      },
      data: { status: "DISMISSED" },
    });
  });

  await logActivity(
    user.id,
    ActivityActions.PAYMENT_MARKED_PAID,
    "RentPayment",
    paymentId,
  );
  revalidatePath(`/leases/${payment.leaseId}`);
  revalidatePath("/reports");
  return { success: true as const };
}

export async function markLeaseExpired(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const lease = await prisma.lease.findUnique({ where: { id } });
  if (!lease) return { error: "Lease not found" };

  await prisma.$transaction(async (tx) => {
    await tx.lease.update({
      where: { id },
      data: { status: "EXPIRED" },
    });

    await tx.property.update({
      where: { id: lease.propertyId },
      data: { status: "AVAILABLE" },
    });

    await tx.propertyStatusLog.create({
      data: {
        propertyId: lease.propertyId,
        status: "AVAILABLE",
        note: `Lease expired for ${lease.tenantName}`,
      },
    });
  });

  await logActivity(user.id, ActivityActions.LEASE_EXPIRED, "Lease", id);
  revalidatePath(`/leases/${id}`);
  revalidatePath("/leases");
  revalidatePath("/properties");
  revalidatePath("/reports");
  return { success: true as const };
}

export async function refundDeposit(
  id: string,
  data: z.infer<typeof refundSchema>,
) {
  const parsed = refundSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.lease.update({
    where: { id },
    data: {
      depositRefunded: true,
      depositRefundDate: new Date(parsed.data.refundDate),
      depositRefundNote: parsed.data.note || null,
    },
  });

  await logActivity(user.id, ActivityActions.DEPOSIT_REFUNDED, "Lease", id);
  revalidatePath(`/leases/${id}`);
  return { success: true as const };
}

export async function getLeases(params: {
  status?: string;
  page?: number;
}) {
  const page = params.page ?? 1;
  const perPage = 25;
  const where: Record<string, unknown> = {};

  if (params.status && params.status !== "all") {
    where.status = params.status;
  }

  const [leases, total] = await Promise.all([
    prisma.lease.findMany({
      where,
      include: { property: true },
      orderBy: { endDate: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.lease.count({ where }),
  ]);

  return {
    leases: leases.map((l) => ({
      id: l.id,
      propertyName: l.property.name,
      unitNumber: l.property.unitNumber,
      tenantName: l.tenantName,
      startDate: l.startDate,
      endDate: l.endDate,
      rentAmount: Number(l.rentAmount),
      status: l.status,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

export async function getLease(id: string) {
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: {
      property: true,
      payments: { orderBy: { dueDate: "asc" } },
      rentRevisions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!lease) return null;

  return {
    ...lease,
    rentAmount: Number(lease.rentAmount),
    depositAmount: lease.depositAmount ? Number(lease.depositAmount) : null,
    payments: lease.payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    })),
    rentRevisions: lease.rentRevisions.map((r) => ({
      ...r,
      previousRent: Number(r.previousRent),
      newRent: Number(r.newRent),
    })),
  };
}
