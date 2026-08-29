import { parentPort, workerData } from "worker_threads";
import mongoose from "mongoose";
import dotenv from "dotenv";
import _ from "lodash";

import Agent from "../models/Agent.js";
import User from "../models/User.js";
import UserAccount from "../models/UserAccount.js";
import LOB from "../models/LOB.js";
import Carrier from "../models/Carrier.js";
import Policy from "../models/Policy.js";

import { parseFile } from "../utils/file-parser.js";
import { bulkUpsert } from "../helper/csvhelper.js";

dotenv.config();

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

    const users = _.uniqBy(
        _.compact(
            rows.map((item) => {
                const firstName = _.trim(_.get(item, "firstname", ""));
                const email = _.toLower(_.trim(_.get(item, "email", "")));

                if (!firstName || !email) return null;

                return {
                    firstName : firstName,
                    dob: _.get(item, "dob", null),
                    address: _.get(item, "address", null),
                    phoneNumber: _.toString(_.get(item, "phone", "")),
                    state: _.get(item, "state", null),
                    zipCode: _.toString(_.get(item, "zip", "")),
                    email,
                    gender: _.get(item, "gender", null),
                    userType: _.get(item, "userType", null),
                };
            })
        ),
        (user) => `${user.phoneNumber}_${_.toLower(_.trim(user.firstName))}`
    );

    const carriers = _.uniqBy(
        _.compact(
            rows.map((item) => {
                const companyName = _.trim(
                    _.get(item, "company_name", "")
                );

                if (!companyName) return null;

                return {
                    companyName,
                };
            })
        ),
        (carrier) => _.toLower(_.trim(carrier.companyName))
    );

    const lobs = _.uniqBy(
        _.compact(
            rows.map((item) => {
                const categoryName = _.trim(
                    _.get(item, "category_name", "")
                );

                if (!categoryName) return null;

                return {
                    categoryName,
                };
            })
        ),
        (lob) => _.toLower(_.trim(lob.categoryName))
    );

    const agents = _.uniqBy(
        _.compact(
            rows.map((item) => {
                const agentName = _.trim(
                    _.get(item, "agent", "")
                );

                if (!agentName) return null;

                return {
                    agentName,
                };
            })
        ),
        (agent) => _.toLower(_.trim(agent.agentName))
    );

    const userAccounts = _.uniqBy(
        _.compact(
            rows.map((item) => {
                const accountName = _.trim(
                    _.get(item, "account_name", "")
                );

                if (!accountName) return null;

                return {
                    accountName,
                };
            })
        ),
        (account) => _.toLower(_.trim(account.accountName))
    );

    await bulkUpsert(
        User,
        users,
        ["email", "phoneNumber"]
    );
    
    await bulkUpsert(
        Carrier,
        carriers,
        ["companyName"]
    );
    
    await bulkUpsert(
        LOB,
        lobs,
        ["categoryName"]
    );
    
    await bulkUpsert(
        Agent,
        agents,
        ["agentName"]
    );

    await bulkUpsert(
        UserAccount,
        userAccounts,
        ["accountName"]
    );


    const lobsDB = await LOB.find();
    const carriersDB = await Carrier.find();
    const usersDB = await User.find();

    const lobMap = _.keyBy(
        lobsDB,
        (lob) => _.toLower(_.trim(_.get(lob, "categoryName", "")))
    );
    
    const carrierMap = _.keyBy(
        carriersDB,
        (carrier) => _.toLower(_.trim(_.get(carrier, "companyName", "")))
    );
    
    const userMap = _.keyBy(
        usersDB,
        (user) => _.toLower(_.trim(_.get(user, "email", "")))
    );
    
    const policies = _.compact(
        rows.map((item) => {
            const categoryName = _.toLower(
                _.trim(_.get(item, "category_name", ""))
            );
    
            const companyName = _.toLower(
                _.trim(_.get(item, "company_name", ""))
            );
    
            const email = _.toLower(
                _.trim(_.get(item, "email", ""))
            );
    
            const lob = _.get(lobMap, categoryName);
            const carrier = _.get(carrierMap, companyName);
            const user = _.get(userMap, email);
    
            if (!lob || !carrier || !user) {
                return null;
            }
    
            return {
                policyNumber: _.get(item, "policy_number", null),
                policyStartDate: _.get(item, "policy_start_date", null),
                policyEndDate: _.get(item, "policy_end_date", null),
                policyCategory: _.get(lob, "_id", null),
                company: _.get(carrier, "_id", null),
                user: _.get(user, "_id", null),
            };
        })
    );

    await bulkUpsert(
        Policy,
        policies,
        ["policyNumber"]
    );




    await mongoose.disconnect();

    return {
        Message: "Data imported successfully."
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