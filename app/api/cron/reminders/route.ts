import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const in10Days = new Date(today);
  in10Days.setDate(in10Days.getDate() + 10);

  const in42Days = new Date(today);
  in42Days.setDate(in42Days.getDate() + 42);

  const [paymentResult, renewalResult] = await Promise.all([
    prisma.reminder.updateMany({
      where: {
        type: "PAYMENT_DUE",
        status: "PENDING",
        dueDate: { lte: in10Days },
      },
      data: { status: "SENT", sentAt: new Date() },
    }),
    prisma.reminder.updateMany({
      where: {
        type: { in: ["RENEWAL_6_WEEKS", "RENEWAL_4_WEEKS"] },
        status: "PENDING",
        dueDate: { lte: in42Days },
      },
      data: { status: "SENT", sentAt: new Date() },
    }),
  ]);

  const processed = paymentResult.count + renewalResult.count;

  return NextResponse.json({ ok: true, processed });
}
