import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Task from '../models/Task';

interface IUserPayload {
  _id: string;
  role: string;
  organization: string;
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = req.user as IUserPayload;
    const organizationId = userPayload.organization;

    const users = await User.aggregate([
      // Match users in the same organization
      { $match: { organization: new mongoose.Types.ObjectId(organizationId) } },
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
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET A SINGLE USER BY ID FROM MY ORGANIZATION
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userPayload = req.user as IUserPayload;
      const organizationId = userPayload.organization;
      const userId = req.params.id;
  
      const result = await User.aggregate([
        // Match the specific user in the organization
        { 
          $match: { 
            _id: new mongoose.Types.ObjectId(userId),
            organization: new mongoose.Types.ObjectId(organizationId)
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
    } catch (error) {
      console.error('Error fetching user by id:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };


// DELETE A USER FROM MY ORGANIZATION
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = req.user as IUserPayload;
    const organizationId = userPayload.organization;
    const userId = req.params.id;
    
    // Ensure that the user to be deleted is in the same organization.
    const user = await User.findOne({ _id: userId, organization: organizationId });
    if (!user) {
      res.status(404).json({ message: 'User not found in your organization' });
      return;
    }
    
    await user. deleteOne();
    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
