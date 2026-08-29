import dotenv from "dotenv";

dotenv.config();

import express from "express";
import connectDB from "./config/db.js";

import uploadRoutes from "./routes/upload.routes.js";
import policyRoutes from "./routes/policy.routes.js";
import messageRoutes from "./routes/message.routes.js"

const app = express();
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Create an API  to upload the attached XLSX/CSV data into MongoDB.
app.use("/api", uploadRoutes);

//Search API to find policy info with the help of the username. 
//API to provide aggregated policy by each user.
app.use("/api/policies", policyRoutes);

//Create a post-service that takes the message, day, and time in body parameters
// and it inserts that message into DB at that particular day and time.
app.use("/api/message", messageRoutes);

app.use((error, req, res, next) => {
    res.status(500).json({
        success: false,
        message: error.message
    });
});
export default app;