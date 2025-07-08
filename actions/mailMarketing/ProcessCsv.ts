"use server";

interface ProcessedCSV {
  headers: string[];
  data: Record<string, string>[];
  totalRows: number;
}

export async function processCSV(formData: FormData): Promise<ProcessedCSV> {
    const file = formData.get("file") as File;
    const text = await file.text();
  const rows = text.split("\n").filter(row => row.trim() !== "");
  const headers = rows[0].split(",").map(header => header.trim());

  const data = rows.slice(1).map(row => {
    const values = row.split(",").map(value => value.trim());
    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowData[header] = values[index] || "";
    });
    return rowData;
  });

  return {
    headers,
    data,
    totalRows: data.length
  };
}
