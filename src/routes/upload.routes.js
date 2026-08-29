import express from "express";
import multer from "multer";
import path from "path";

import {
    uploadPolicyFile
} from "../controllers/upload.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);

        cb(
            null,
            `policy-${Date.now()}${extension}`
        );
    }
});

const upload = multer({
    storage,

    fileFilter: (req, file, cb) => {
        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        if (
            [".xlsx", ".xls", ".csv"].includes(extension)
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only XLSX, XLS and CSV files are allowed"
                )
            );
        }
    }
});

router.post(
    "/upload",
    upload.single("file"),
    uploadPolicyFile
);

export default router;