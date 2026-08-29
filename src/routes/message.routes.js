import express from "express";

import {
    scheduleMessage
} from "../controllers/message.controller.js";

const router = express.Router();

router.post(
    "/",
    scheduleMessage
);

export default router;