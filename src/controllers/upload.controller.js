import fs from "fs";
import { startImportWorker } from "../services/import.service.js";

export const uploadPolicyFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload XLSX or CSV file"
            });
        }

        const filePath = req.file.path;

        const result = await startImportWorker(filePath);

        fs.unlinkSync(filePath);

        return res.status(200).json({
            success: true,
            message: "File imported successfully",
            data: result
        });
    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: "File import failed",
            error: error.message
        });
    }
};