"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

export async function getUnreadReminderCount(): Promise<number> {
  const userId = await getUserId();
  if (!userId) return 0;

  return prisma.reminder.count({
    where: {
      userId,
      status: { in: ["PENDING", "SENT"] },
    },
  });
}

export async function getRecentReminders() {
  const userId = await getUserId();
  if (!userId) return [];

  const reminders = await prisma.reminder.findMany({
    where: {
      userId,
      status: { in: ["PENDING", "SENT"] },
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  return reminders.map((r) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    dueDate: r.dueDate,
    status: r.status,
    type: r.type,
  }));
}

export async function getReminders() {
  const userId = await getUserId();
  if (!userId) return [];

  const reminders = await prisma.reminder.findMany({
    where: {
      userId,
      status: { in: ["PENDING", "SENT", "READ"] },
    },
    orderBy: { dueDate: "asc" },
  });

  return reminders.map((r) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    dueDate: r.dueDate,
    status: r.status,
    type: r.type,
    sentAt: r.sentAt,
    readAt: r.readAt,
  }));
}

export async function dismissReminder(id: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };

  const reminder = await prisma.reminder.findFirst({
    where: { id, userId },
  });
  if (!reminder) return { error: "Reminder not found" };

  await prisma.reminder.update({
    where: { id },
    data: { status: "DISMISSED" },
  });

  revalidatePath("/reminders");
  revalidatePath("/");
  return { success: true as const };
}

export async function markReminderRead(id: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };

  const reminder = await prisma.reminder.findFirst({
    where: { id, userId },
  });
  if (!reminder) return { error: "Reminder not found" };

  await prisma.reminder.update({
    where: { id },
    data: { status: "READ", readAt: new Date() },
  });

  revalidatePath("/reminders");
  revalidatePath("/");
  return { success: true as const };
}
