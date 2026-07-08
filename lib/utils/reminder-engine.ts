import {
  addMonths,
  endOfMonth,
  setDate,
  startOfMonth,
  isBefore,
  isAfter,
} from "date-fns";
import type { Lease, Prisma } from "@prisma/client";
import { ReminderType } from "@prisma/client";
import { decodePaymentDue } from "@/lib/utils/payment-frequency";

type TransactionClient = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

function clampDueDate(year: number, month: number, day: number): Date {
  const base = new Date(year, month, 1);
  const lastDay = endOfMonth(base).getDate();
  const actualDay = Math.min(day, lastDay);
  return setDate(base, actualDay);
}

export async function generatePaymentSchedule(
  lease: Pick<
    Lease,
    "id" | "startDate" | "endDate" | "rentAmount" | "paymentDueDay"
  >,
  tx: TransactionClient,
  fromDate?: Date,
) {
  const { day, frequencyMonths } = decodePaymentDue(lease.paymentDueDay);

  const scheduleStart = fromDate
    ? startOfMonth(addMonths(fromDate, 1))
    : startOfMonth(lease.startDate);
  const scheduleEnd = lease.endDate;

  const payments: {
    leaseId: string;
    dueDate: Date;
    amount: number;
  }[] = [];

  let current = scheduleStart;
  while (!isAfter(current, scheduleEnd)) {
    const dueDate = clampDueDate(
      current.getFullYear(),
      current.getMonth(),
      day,
    );

    if (!isBefore(dueDate, lease.startDate) && !isAfter(dueDate, scheduleEnd)) {
      payments.push({
        leaseId: lease.id,
        dueDate,
        // Stored rentAmount is the period rent for the chosen frequency
        amount: Number(lease.rentAmount),
      });
    }

    current = addMonths(current, frequencyMonths);
  }

  if (payments.length > 0) {
    await tx.rentPayment.createMany({ data: payments });
  }

  return payments;
}

async function reminderExists(
  tx: TransactionClient,
  type: ReminderType,
  leaseId: string,
) {
  const existing = await tx.reminder.findFirst({
    where: {
      type,
      leaseId,
      status: { in: ["PENDING", "SENT"] },
    },
  });
  return !!existing;
}

export async function generateLeaseReminders(
  lease: Pick<
    Lease,
    "id" | "endDate" | "propertyId" | "tenantName" | "rentAmount"
  >,
  propertyName: string,
  userId: string,
  tx: TransactionClient,
  payments?: { dueDate: Date }[],
) {
  const renewalTypes: ReminderType[] = [
    "RENEWAL_6_WEEKS",
    "RENEWAL_4_WEEKS",
  ];

  for (const type of renewalTypes) {
    const exists = await reminderExists(tx, type, lease.id);
    if (!exists) {
      const weeks = type === "RENEWAL_6_WEEKS" ? "6 weeks" : "4 weeks";
      await tx.reminder.create({
        data: {
          type,
          title: `Lease renewal in ${weeks}`,
          message: `Lease for ${propertyName} (${lease.tenantName}) expires on ${lease.endDate.toLocaleDateString("en-LK")}. Rent: LKR ${Number(lease.rentAmount).toLocaleString()}.`,
          dueDate: lease.endDate,
          propertyId: lease.propertyId,
          leaseId: lease.id,
          userId,
        },
      });
    }
  }

  if (payments) {
    for (const payment of payments) {
      const existing = await tx.reminder.findFirst({
        where: {
          type: "PAYMENT_DUE",
          leaseId: lease.id,
          status: { in: ["PENDING", "SENT"] },
          dueDate: payment.dueDate,
        },
      });
      if (!existing) {
        await tx.reminder.create({
          data: {
            type: "PAYMENT_DUE",
            title: "Rent payment due",
            message: `Rent payment of LKR ${Number(lease.rentAmount).toLocaleString()} due for ${propertyName} (${lease.tenantName}) on ${payment.dueDate.toLocaleDateString("en-LK")}.`,
            dueDate: payment.dueDate,
            propertyId: lease.propertyId,
            leaseId: lease.id,
            userId,
          },
        });
      }
    }
  } else {
    const leasePayments = await tx.rentPayment.findMany({
      where: { leaseId: lease.id },
    });
    for (const payment of leasePayments) {
      const existing = await tx.reminder.findFirst({
        where: {
          type: "PAYMENT_DUE",
          leaseId: lease.id,
          status: { in: ["PENDING", "SENT"] },
          dueDate: payment.dueDate,
        },
      });
      if (!existing) {
        await tx.reminder.create({
          data: {
            type: "PAYMENT_DUE",
            title: "Rent payment due",
            message: `Rent payment of LKR ${Number(lease.rentAmount).toLocaleString()} due for ${propertyName} (${lease.tenantName}) on ${payment.dueDate.toLocaleDateString("en-LK")}.`,
            dueDate: payment.dueDate,
            propertyId: lease.propertyId,
            leaseId: lease.id,
            userId,
          },
        });
      }
    }
  }
}

export async function createNewListingReminder(
  property: { id: string; name: string; unitNumber: string | null },
  userId: string,
  tx: TransactionClient,
) {
  const existing = await tx.reminder.findFirst({
    where: {
      type: "NEW_LISTING",
      propertyId: property.id,
      status: { in: ["PENDING", "SENT"] },
    },
  });
  if (existing) return;

  const label = property.unitNumber
    ? `${property.name} (${property.unitNumber})`
    : property.name;

  await tx.reminder.create({
    data: {
      type: "NEW_LISTING",
      title: "New portfolio listing",
      message: `${label} was added to the portfolio.`,
      dueDate: new Date(),
      propertyId: property.id,
      userId,
    },
  });
}
