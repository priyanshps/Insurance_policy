import cron from "node-cron";
import Message from "../models/Message.js";

cron.schedule("* * * * *", async () => {
    try {
        const now = new Date();
        const messages = await Message.find({
            status: "pending",
            scheduledAt: {
                $lte: now
            }
        });
        for (const message of messages) {
            message.status = "inserted";
            await message.save();
        }
    } catch (error) {
        console.error("Scheduler error:", error);
    }
});