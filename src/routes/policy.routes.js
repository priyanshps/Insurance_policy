import express from "express";

import {
    searchPolicyByUsername,
    getPoliciesByUser
} from "../controllers/policy.controller.js";

const router = express.Router();


// Search policy by username
router.get(
    "/search",
    searchPolicyByUsername
);


// Aggregate policies by user
router.get(
    "/by-user",
    getPoliciesByUser
);

export default router;