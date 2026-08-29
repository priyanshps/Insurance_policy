import { parentPort, workerData } from "worker_threads";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Agent from "../models/Agent.js";
import User from "../models/User.js";
import UserAccount from "../models/UserAccount.js";
import LOB from "../models/LOB.js";
import Carrier from "../models/Carrier.js";
import Policy from "../models/Policy.js";

import { parseFile } from "../utils/file-parser.js";

dotenv.config();

const normalize = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
};

const parseDate = (value) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
};

const importData = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const rows = parseFile(workerData.filePath);
    /*
        Set values to remove duplicates

        I have considered `firstname` as the unique value for removing duplicates, 
        as it appears to be the only field in the CSV data that is consistently unique.

     */
    const agentCache = new Set();
    const userCache = new Set();
    const accountCache = new Set();
    const lobCache = new Set();
    const carrierCache = new Set();

    const users = rows.map((item) => {

        if (!item.firstname || !item.email) {
            return
        }

        const phoneNumber = item.phone?.toString();
        const name = item.firstname?.trim().toLowerCase();



        const key = `${phoneNumber}_${name}`


        if (!userCache.has(key)) {
            userCache.add(key);

            return {
                firstName: item.firstname,
                dob: item.dob,
                address: item.address,
                phoneNumber,
                state: item.state,
                zipCode: item.zip?.toString(),
                email: item.email?.trim().toLowerCase(),
                gender: item.gender,
                userType: item.userType
            };
        }
    }).filter(Boolean);

    const carriers = rows.map((item) => {
        const companyName = item.company_name?.trim();

        if (!carrierCache.has(companyName.toLowerCase())) {
            carrierCache.add(companyName.toLowerCase())
            return {
                companyName
            };
        }
    }).filter(Boolean);


    const lobs = rows.map((item) => {
        const categoryName = item.category_name?.trim();

        if (!lobCache.has(categoryName.toLowerCase())) {
            lobCache.add(categoryName.toLowerCase());

            return {
                categoryName
            };
        }
    }).filter(Boolean);


    const agents = rows.map((item) => {
        const agentName = item.agent?.trim();

        if (!agentName) return;

        if (!agentCache.has(agentName.toLowerCase())) {
            agentCache.add(agentName.toLowerCase());

            return {
                agentName
            };
        }
    }).filter(Boolean);


    const userAccounts = rows.map((item) => {
        const accountName = item.account_name?.trim();

        if (!accountName) return;

        if (!accountCache.has(accountName.toLowerCase())) {
            accountCache.add(accountName.toLowerCase());

            return {
                accountName
            };
        }
    }).filter(Boolean);



    await User.bulkWrite(
        users.map((user) => ({
            updateOne: {
                filter: {
                    email: user.email,
                    phoneNumber: user.phoneNumber
                },
                update: {
                    $set: user
                },
                upsert: true
            }
        }))
    );

    await Carrier.bulkWrite(
        carriers.map((carrier) => ({
            updateOne: {
                filter: {
                    companyName: carrier.companyName
                },
                update: {
                    $set: carrier
                },
                upsert: true
            }
        }))
    );

    await LOB.bulkWrite(
        lobs.map((lob) => ({
            updateOne: {
                filter: {
                    categoryName: lob.categoryName
                },
                update: {
                    $set: lob
                },
                upsert: true
            }
        }))
    );

    await Agent.bulkWrite(
        agents.map((agent) => ({
            updateOne: {
                filter: {
                    agentName: agent.agentName
                },
                update: {
                    $set: agent
                },
                upsert: true
            }
        }))
    );

    await UserAccount.bulkWrite(
        userAccounts.map((account) => ({
            updateOne: {
                filter: {
                    accountName: account.accountName
                },
                update: {
                    $set: account
                },
                upsert: true
            }
        }))
    );


    const lobsDB = await LOB.find();
    const carriersDB = await Carrier.find();
    const usersDB = await User.find();

    const policies = rows
        .map((item) => {
            const lob = lobsDB.find(
                (l) =>
                    l.categoryName.toLowerCase() ===
                    item.category_name?.trim().toLowerCase()
            );

            const carrier = carriersDB.find(
                (c) =>
                    c.companyName.toLowerCase() ===
                    item.company_name?.trim().toLowerCase()
            );

            const user = usersDB.find(
                (u) =>
                    u.email?.toLowerCase() ===
                    item.email?.trim().toLowerCase()
            );

            if (!lob || !carrier || !user) {
                return null;
            }

            return {
                policyNumber: item.policy_number,
                policyStartDate: item.policy_start_date,
                policyEndDate: item.policy_end_date,
                policyCategory: lob._id,
                company: carrier._id,
                user: user._id
            };
        }).filter(Boolean);


    await Policy.bulkWrite(
        policies.map((policy) => ({
            updateOne: {
                filter: {
                    policyNumber: policy.policyNumber
                },
                update: {
                    $set: policy
                },
                upsert: true
            }
        }))
    );




    await mongoose.disconnect();

    return {
        totalRows: rows.length
    };
};

importData()
    .then((result) => {
        parentPort.postMessage({
            success: true,
            ...result
        });
    })
    .catch((error) => {
        parentPort.postMessage({
            success: false,
            error: error.message
        });
    });