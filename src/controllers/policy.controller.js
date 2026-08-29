import Policy from "../models/Policy.js";
import User from "../models/User.js";

//Search API to find policy info with the help of the username.
export const searchPolicyByUsername = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: "username query parameter is required"
            });
        }

        const policies = await Policy.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $match: {
                    "user.firstName": {
                        $regex: username,
                        $options: "i"
                    }
                }
            },
            {
                $lookup: {
                    from: "lobs",
                    localField: "policyCategory",
                    foreignField: "_id",
                    as: "policyCategory"
                }
            },
            {
                $unwind: "$policyCategory"
            },
            {
                $lookup: {
                    from: "carriers",
                    localField: "company",
                    foreignField: "_id",
                    as: "company"
                }
            },
            {
                $unwind: "$company"
            },
            {
                $project: {
                    __v: 0
                }
            }
        ]);

        if (!policies.length) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            count: policies.length,
            data: policies
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to search policies",
            error: error.message
        });
    }
};


// API to provide aggregated policy by each user.
/*  
{ 
    user :  {}
    policies : [ Policy 1 , Policy 2, Policy 3 ] 
}
*/

export const getPoliciesByUser = async (req, res) => {
    try {
        const result = await User.aggregate([
            {
                $lookup: {
                    from: "policies",
                    localField: "_id",
                    foreignField: "user",
                    as: "policies"
                }
            },
            {
                $unwind: "$policies"
            },
            {
                $project: {
                    _id: 0,

                    user: {
                        _id: "$_id",
                        firstName: "$firstName",
                        dob: "$dob",
                        address: "$address",
                        phoneNumber: "$phoneNumber",
                        state: "$state",
                        zipCode: "$zipCode",
                        email: "$email",
                        gender: "$gender",
                        userType: "$userType"
                    },

                    policy: "$policies"
                }
            },
            {
                $lookup: {
                    from: "lobs",
                    localField: "policy.policyCategory",
                    foreignField: "_id",
                    as: "policyCategory"
                }
            },

            {
                $unwind: "$policyCategory"
            },
            {
                $lookup: {
                    from: "carriers",
                    localField: "policy.company",
                    foreignField: "_id",
                    as: "company"
                }
            },

            {
                $unwind: "$company"
            },
            {
                $project: {
                    user: 1,

                    policy: {
                        _id: "$policy._id",
                        policyNumber: "$policy.policyNumber",
                        policyStartDate: "$policy.policyStartDate",
                        policyEndDate: "$policy.policyEndDate",
                        policyCategory: "$policyCategory",
                        company: "$company"
                    }
                }
            },
            {
                $group: {
                    _id: "$user._id",

                    user: {
                        $first: "$user"
                    },

                    policies: {
                        $push: "$policy"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    user: 1,
                    policyCount: {
                        $size: "$policies"
                    },
                    policies: 1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to aggregate policies",
            error: error.message
        });
    }
};