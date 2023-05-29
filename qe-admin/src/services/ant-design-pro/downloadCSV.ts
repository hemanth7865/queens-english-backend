import { saveAs } from "file-saver";

export function downloadCSV(data: any[]) {
  const fileName = `Student_Bulk_Upload_${Date.now()}.csv`;
  if (data.length > 0) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, fileName);
  }
}

function convertToCSV(data: any[]) {
  let headers: string[] = getHeaders(data);
  headers = headers.filter((item) => item !== "Error");
  headers.push("Error");
  const rows = data.map((item) => {
    return headers
      .map((header) => {
        return item[header];
      })
      .join(",");
  });
  return headers.join(",") + "\n" + rows.join("\n");
}

function getHeaders(array: any[]) {
  const fields = array.reduce((result, obj) => {
    Object.keys(obj).forEach((key) => {
      if (!result.includes(key)) {
        result.push(key);
      }
    });
    return result;
  }, []);
  return fields;
}
