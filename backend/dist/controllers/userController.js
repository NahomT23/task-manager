"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUserById = exports.getUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userPayload = req.user;
        const organizationId = userPayload.organization;
        const users = yield User_1.default.aggregate([
            // Match users in the same organization
            { $match: { organization: new mongoose_1.default.Types.ObjectId(organizationId) } },
            // Lookup tasks assigned to each user within the same organization
            {
                $lookup: {
                    from: 'tasks', // The name of the Task collection in MongoDB
                    let: { userId: '$_id', orgId: '$organization' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$assignedTo', '$$userId'] },
                                        { $eq: ['$organization', '$$orgId'] },
                                    ],
                                },
                            },
                        },
                        // Group tasks by their status and count each group
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    as: 'taskCounts',
                },
            },
            // Add fields for each task status count
            {
                $addFields: {
                    pendingTasks: {
                        $let: {
                            vars: {
                                pending: {
                                    $filter: {
                                        input: '$taskCounts',
                                        as: 'tc',
                                        cond: { $eq: ['$$tc._id', 'pending'] },
                                    },
                                },
                            },
                            in: { $ifNull: [{ $arrayElemAt: ['$$pending.count', 0] }, 0] },
                        },
                    },
                    inProgressTasks: {
                        $let: {
                            vars: {
                                inProgress: {
                                    $filter: {
                                        input: '$taskCounts',
                                        as: 'tc',
                                        cond: { $eq: ['$$tc._id', 'in progress'] },
                                    },
                                },
                            },
                            in: { $ifNull: [{ $arrayElemAt: ['$$inProgress.count', 0] }, 0] },
                        },
                    },
                    completedTasks: {
                        $let: {
                            vars: {
                                completed: {
                                    $filter: {
                                        input: '$taskCounts',
                                        as: 'tc',
                                        cond: { $eq: ['$$tc._id', 'completed'] },
                                    },
                                },
                            },
                            in: { $ifNull: [{ $arrayElemAt: ['$$completed.count', 0] }, 0] },
                        },
                    },
                },
            },
            // Remove unnecessary fields
            {
                $project: {
                    password: 0,
                },
            },
        ]);
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUsers = getUsers;
// GET A SINGLE USER BY ID FROM MY ORGANIZATION
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userPayload = req.user;
        const organizationId = userPayload.organization;
        const userId = req.params.id;
        const result = yield User_1.default.aggregate([
            // Match the specific user in the organization
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(userId),
                    organization: new mongoose_1.default.Types.ObjectId(organizationId)
                }
            },
            // Lookup tasks assigned to this user
            {
                $lookup: {
                    from: 'tasks',
                    let: { userId: '$_id', orgId: '$organization' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$assignedTo', '$$userId'] },
                                        { $eq: ['$organization', '$$orgId'] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    as: 'taskCounts'
                }
            },
            // Add task count fields
            {
                $addFields: {
                    pendingTasks: {
                        $let: {
                            vars: {
                                pending: {
                                    $filter: {
                                        input: '$taskCounts',
                                        as: 'tc',
                                        cond: { $eq: ['$$tc._id', 'pending'] }
                                    }
                                }
                            },
                            in: { $ifNull: [{ $arrayElemAt: ['$$pending.count', 0] }, 0] }
                        }
                    },
                    inProgressTasks: {
                        $let: {
                            vars: {
                                inProgress: {
                                    $filter: {
                                        input: '$taskCounts',
                                        as: 'tc',
                                        cond: { $eq: ['$$tc._id', 'in progress'] }
                                    }
                                }
                            },
                            in: { $ifNull: [{ $arrayElemAt: ['$$inProgress.count', 0] }, 0] }
                        }
                    },
                    completedTasks: {
                        $let: {
                            vars: {
                                completed: {
                                    $filter: {
                                        input: '$taskCounts',
                                        as: 'tc',
                                        cond: { $eq: ['$$tc._id', 'completed'] }
                                    }
                                }
                            },
                            in: { $ifNull: [{ $arrayElemAt: ['$$completed.count', 0] }, 0] }
                        }
                    }
                }
            },
            // Remove sensitive fields
            {
                $project: {
                    password: 0,
                }
            }
        ]);
        if (result.length === 0) {
            res.status(404).json({ message: 'User not found in your organization' });
            return;
        }
        res.status(200).json(result[0]);
    }
    catch (error) {
        console.error('Error fetching user by id:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserById = getUserById;
// DELETE A USER FROM MY ORGANIZATION
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userPayload = req.user;
        const organizationId = userPayload.organization;
        const userId = req.params.id;
        // Ensure that the user to be deleted is in the same organization.
        const user = yield User_1.default.findOne({ _id: userId, organization: organizationId });
        if (!user) {
            res.status(404).json({ message: 'User not found in your organization' });
            return;
        }
        yield user.deleteOne();
        res.status(200).json({ message: 'User removed successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteUser = deleteUser;
