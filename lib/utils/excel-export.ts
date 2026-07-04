import * as XLSX from "xlsx";

export function buildExcelBuffer(
  sheetName: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
): ArrayBuffer {
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const array = XLSX.write(workbook, {
    type: "array",
    bookType: "xlsx",
  }) as number[];
  return Uint8Array.from(array).buffer;
}

export function excelResponse(buffer: ArrayBuffer, filename: string) {
  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
