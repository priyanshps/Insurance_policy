import fs from "fs";
import path from "path";
import XLSX from "xlsx";

export const parseFile = (filePath) => {
    const extension = path.extname(filePath).toLowerCase();

    if (![".xlsx", ".xls", ".csv"].includes(extension)) {
        throw new Error("Only XLSX, XLS and CSV files are supported");
    }

    const workbook = XLSX.readFile(filePath, {
        cellDates: true
    });

    const sheetName = workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: null
    });

    return rows;
};