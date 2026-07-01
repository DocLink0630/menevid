import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeaseAgreementPDF } from "@/lib/utils/lease-pdf";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: { property: true },
  });

  if (!lease) {
    return new NextResponse("Not found", { status: 404 });
  }

  const pdfBuffer = await renderToBuffer(
    <LeaseAgreementPDF
      propertyName={lease.property.name}
      unitNumber={lease.property.unitNumber}
      tenantName={lease.tenantName}
      tenantNic={lease.tenantNic}
      tenantPhone={lease.tenantPhone}
      tenantEmail={lease.tenantEmail}
      startDate={formatDate(lease.startDate)}
      endDate={formatDate(lease.endDate)}
      rentAmount={formatCurrency(Number(lease.rentAmount))
        .replace("LKR", "")
        .trim()}
      depositAmount={
        lease.depositAmount
          ? formatCurrency(Number(lease.depositAmount))
              .replace("LKR", "")
              .trim()
          : "0"
      }
      paymentDueDay={lease.paymentDueDay}
    />,
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="lease-${id}.pdf"`,
    },
  });
}
