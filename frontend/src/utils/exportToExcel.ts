import {
  buildRows,
  getHeaderLabels,
  getOrderedHeaders,
} from "./flattenEntries";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface HandleExportToExcelProps {
  data: any[];
  fileNamePrefix: string;
}

const handleExportToExcel = ({
  data,
  fileNamePrefix = "entries",
}: HandleExportToExcelProps) => {
  if (!data || data.length === 0) return;

  const headers = getOrderedHeaders(data);
  const headerLabels = getHeaderLabels(headers);
  const rows = buildRows(data, headers);

  const labeledRows = rows.map((row) => {
    const labeled: Record<string, any> = {};
    headers.forEach((key, i) => {
      labeled[headerLabels[i]] = row[key];
    });
    return labeled;
  });

  const worksheet = XLSX.utils.json_to_sheet(labeledRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  // Generate filename with current date and time
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const dateStr = `${day}-${month}-${year}`;
  const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
  const fileName = `${fileNamePrefix}_${dateStr}_${timeStr}.xlsx`;

  saveAs(blob, fileName);
};

export default handleExportToExcel;
