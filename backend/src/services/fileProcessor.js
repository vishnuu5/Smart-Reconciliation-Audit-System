import Papa from "papaparse";
import ExcelJS from "exceljs";
import crypto from "crypto";
import fs from "fs";

export const calculateFileHash = (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
  } catch (error) {
    console.error("Error calculating file hash:", error);
    throw new Error(`Failed to calculate file hash: ${error.message}`);
  }
};

export const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    const results = [];

    Papa.parse(stream, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results) {
          reject(new Error("Parsing completed but no results returned"));
          return;
        }
        if (results.errors && results.errors.length > 0) {
          console.warn("CSV parsing errors:", results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const parseExcel = async (filePath) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new Error("No worksheets found in Excel file");
    }

    const data = [];
    const headerRow = worksheet.getRow(1);
    const headers = [];

    // Get headers from first row
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value;
    });
    // Get data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          rowData[header] = cell.value;
        }
      });

      if (
        Object.keys(rowData).some(
          (key) => rowData[key] !== null && rowData[key] !== undefined,
        )
      ) {
        data.push(rowData);
      }
    });

    return data;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

export const parseFile = async (filePath, fileType) => {
  try {
    console.log("Parsing file:", filePath, "Type:", fileType);

    let data;
    if (fileType === "text/csv") {
      data = await parseCSV(filePath);
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      data = await parseExcel(filePath);
    } else {
      throw new Error("Unsupported file type");
    }

    console.log("File parsed successfully, data length:", data?.length);

    if (!data || data.length === 0) {
      throw new Error("File is empty or no data found");
    }
    const firstRow = data[0];
    console.log("First row data:", firstRow);

    return data;
  } catch (error) {
    console.error("Parse file error:", error);
    throw error;
  }
};

export const getPreviewData = (data, count = 20) => {
  return data.slice(0, count);
};

export const normalizeFieldName = (fieldName) => {
  return fieldName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

export const extractFieldNames = (data) => {
  if (!data || data.length === 0) {
    return [];
  }
  return Object.keys(data[0]);
};
