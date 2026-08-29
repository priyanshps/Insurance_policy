import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startImportWorker = (filePath) => {
    return new Promise((resolve, reject) => {
        const workerPath = path.join(
            __dirname,
            "../workers/import.worker.js"
        );

        const worker = new Worker(workerPath, {
            workerData: {
                filePath
            }
        });
        worker.on("message", (result) => {
            if (result.success) {
                resolve(result);
            } else {
                reject(new Error(result.error));
            }
        });

        worker.on("error", (error) => {
            reject(error);
        });

        worker.on("exit", (code) => {
            if (code !== 0) {
                reject(
                    new Error(
                        `Worker stopped with exit code ${code}`
                    )
                );
            }
        });
    });
};