import Message from "../models/Message.js";


export const scheduleMessage = async (req, res) => {
    try {
        const { message, day, time } = req.body;

        if (!message || !day || !time) {
            return res.status(400).json({
                success: false,
                message: "message, day and time are required"
            });
        }

        const scheduledAt = new Date(`${day}T${time}:00`);

        if (isNaN(scheduledAt.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid day or time"
            });
        }

        await Message.create({
            message,
            scheduledAt
        });

        return res.status(201).json({
            success: true,
            message: "Message scheduled successfully",
            scheduledAt
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};