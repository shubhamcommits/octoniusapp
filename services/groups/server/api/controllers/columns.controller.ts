import { Request, Response, NextFunction } from 'express';
import { Column, Group, Post, TimeTrackingEntity } from '../models';
import { sendError } from '../../utils';
import moment from 'moment';

export class ColumnsController {

    // get all existing columns
    async get(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch GroupId from the query
            const sectionId = req.params.sectionId;

            let section = await Column.findOne({
                _id: sectionId 
            }).lean() || [];

            section = await Column.populate(section, [
                { path: '_group' },
                { path: 'budget.expenses._user' },
                { path: 'budget.expenses._resource' },
                { path: 'permissions._members', select: 'first_name last_name profile_pic role email' }
            ]);

            // Send the status 200 response
            return res.status(200).json({
                message: 'Section obtained Successfully!',
                section: section
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // get all existing columns
    async getAllColumns(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch GroupId from the query
            const { groupId } = req.query;

            let columns = await Column.find({
                $and: [
                    { _group: groupId },
                    { archived: { $ne: true }}
                ]
            }).sort({kanban_order: 1}).lean() || [];

            columns = await Column.populate(columns, [
                { path: '_group' },
                { path: 'budget.expenses._user' },
                { path: 'budget.expenses._resource' },
                { path: 'permissions._members', select: 'first_name last_name profile_pic role email' }
            ]);

            // Send the status 200 response
            return res.status(200).json({
                message: 'Column obtained Successfully!',
                columns: columns
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // get all existing archived columns
    async getAllArchivedColumns(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch GroupId from the query
            const { groupId } = req.query;

            let columns = await Column.find({
                $and: [
                    { _group: groupId },
                    { archived: true }
                ]
            }).sort({kanban_order: 1}).lean() || [];

            columns = await Column.populate(columns, [
                { path: '_group' },
                { path: 'budget.expenses._user' },
                { path: 'budget.expenses._resource' },
                { path: 'permissions._members', select: 'first_name last_name profile_pic role email' }
            ]);

            // Send the status 200 response
            return res.status(200).json({
                message: 'Column obtained Successfully!',
                columns: columns
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // get all existing project columns
    async getAllProjectColumns(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch GroupId from the query
            const { groupId, workspaceId, userId } = req.query;

            let columns = [];
            if (groupId) {
              columns = await Column.find({
                $and: [
                    { _group: groupId },
                    { project_type: true },
                    { archived: { $ne: true }}
                ]
              }).lean() || [];

              columns = await Column.populate(columns, [
                { path: '_group' },
                { path: 'budget.expenses._user' },
                { path: 'budget.expenses._resource' },
                { path: 'permissions._members', select: 'first_name last_name profile_pic role email' }
              ]);
            } else if (workspaceId) {
                // Only groups where user is manager
                const groups = await Group.find({
                    $and: [
                        { _workspace: workspaceId },
                        { _admins: userId },
                    ]
                })
                .select('_id')
                .lean() || [];

              columns = await Column.find({
                $and: [
                    { '_group': { $in: groups }},
                    { project_type: true },
                    { archived: { $ne: true }}
                ]
              }).lean() || [];

              columns = await Column.populate(columns, [
                { path: '_group' },
                { path: 'budget.expenses._user' },
                { path: 'budget.expenses._resource' },
                { path: 'permissions._members', select: 'first_name last_name profile_pic role email' }
              ]);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Column obtained Successfully!',
                columns: columns
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // get all existing project columns filtering by groups
    async getGroupProjectColumnsByGroups(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch GroupId from the query
            const { workspaceId, filteringGroups } = req.query;

            let columns = [];
            if (workspaceId) {
              columns = await Column.find({
                $and: [
                    { '_group': { $in: filteringGroups }},
                    { project_type: true },
                    { archived: { $ne: true }}
                ]
              }).lean() || [];

              columns = await Column.populate(columns, [
                { path: '_group' },
                { path: 'budget.expenses._user' },
                { path: 'budget.expenses._resource' },
                { path: 'permissions._members', select: 'first_name last_name profile_pic role email' }
              ]);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Column obtained Successfully!',
                columns: columns
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // add a new column

    async addColumn(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = req.body.groupId;
            const columnName = req.body.columnName;
            const kanbanOrder = req.body.kanbanOrder;

            // Preparing the group data
            const columnData = {
                _group: groupId,
                title: columnName,
                kanban_order: kanbanOrder,
                custom_fields_to_show: ['priority']
            }

            // Checking if group already exists
            const columnExist = await Column.findOne({
                $and: [
                    { _group: columnData._group },
                    { title: columnData.title }
                ]
            });

            // If Group Exists in the workspace, then send error response
            if (columnExist) {
                return res.status(409).json({
                    message: 'Oops column name already exist, please try a different one!'
                })
            }

            // If group doesn't exists, then create a new document
            let column = await Column.create(columnData);

            // Send the status 200 response
            return res.status(200).json({
                message: 'Column Created Successfully!',
                column: column
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // edit column name
    async editColumnName(req: Request, res: Response, next: NextFunction) {
        try {
            const columnId = req.body.columnId;
            const newColumnName = req.body.newColumnName;

            if (!columnId || !newColumnName) {
                return sendError(res, new Error('Please provide the group, old name and new name as parameters'), 'Please provide the group, old name and new name as paramaters!', 400);
            }

            const columnToUpdate = await Column.findOne({
                _id: columnId,
                title: newColumnName
            });

            if (columnToUpdate) {
                return sendError(res, new Error('There is already a column with the provided name in this group.'), 'There is already a column with the provided name in this group.', 400);
            }

            const column = await Column.findOneAndUpdate({
                _id: columnId
            }, {
                title: newColumnName
            });

            // Send the status 200 response
            return res.status(200).json({
                message: 'Column Updated Successfully!',
                column: column
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // delete column 
    async deleteColumn(req: Request, res: Response, next: NextFunction) {
        try {
            const sectionId = req.params.sectionId;

            await Post.deleteMany({ 'task._column': sectionId });

            await Column.findOneAndDelete({ _id: sectionId });

            // Send the status 200 response
            return res.status(200).json({
                message: 'Column Deleted Successfully!'
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for updating the custom fields to show in the list view for the particular group
     * @param { column } req 
     * @param res 
     */
    async updateCustomFieldsToShow(req: Request, res: Response, next: NextFunction) {

        // Fetch the fileName from fileHandler middleware
        const column = req.body;

        try {
            // Find the group and update their respective group avatar
            const group = await Column.findOneAndUpdate({
                _id: column.columnId
            }, {
                "$set": {
                    "custom_fields_to_show": column.customFieldsToShow
                }
            }, {
                new: true
            }).select('custom_fields_to_show').lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields to show updated!',
                group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async changeColumnProjectType(req: Request, res: Response, next: NextFunction) {

        // Fetch the fileName from fileHandler middleware
        const { columnId, projectType } = req.body;

        try {
            // Find the group and update their respective group avatar
            const column = await Column.findOneAndUpdate({
                _id: columnId
            }, {
                "$set": {
                    "project_type": projectType
                }
            }, {
                new: true
            }).lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Column set as project!',
                column: column
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async saveColumnProjectDates(req: Request, res: Response, next: NextFunction) {

        // Fetch the fileName from fileHandler middleware
        const { columnId, startDate, dueDate } = req.body;

        try {
            // Find the group and update their respective group avatar
            const column = await Column.findOneAndUpdate({
                _id: columnId
            }, {
                "$set": {
                    start_date: startDate ? moment(startDate).hours(12).format('YYYY-MM-DD') : null,
                    due_date: dueDate ? moment(dueDate).hours(12).format('YYYY-MM-DD') : null,
                }
            }, {
                new: true
            }).lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Column project dates saved!',
                column: column
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async saveAmountBudget(req: Request, res: Response, next: NextFunction) {

        // Fetch the columnId and amountPlanned
        let { columnId, amountPlanned, currency } = req.body;

        try {

            if (!currency) {
                currency = 'EUR'
            }

            // Find the group and update their respective group avatar
            const column = await Column.findOneAndUpdate({
                _id: columnId
            }, {
                "$set": {
                    'budget.amount_planned': amountPlanned,
                    'budget.currency': currency
                }
            }, {
                new: true
            }).lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Column project dates saved!',
                column: column
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async addBudgetExpense(req: Request, res: Response, next: NextFunction) {

        // Fetch the columnId and amountPlanned
        let { sectionId } = req.params;
        let { expense } = req.body;

        try {
            expense._created_user = req['userId'];

            // Find the group and update their respective group avatar
            const column = await Column.findOneAndUpdate({
                    _id: sectionId
                }, {
                    $push: {
                        'budget.expenses': expense
                    }
                }, {
                    new: true
                }).lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Column project dates saved!',
                column: column
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async updateBudgetExpense(req: Request, res: Response, next: NextFunction) {

        // Fetch the columnId and amountPlanned
        let { sectionId } = req.params;
        let { expense } = req.body;

        try {
            // Find the group and update their respective group avatar
            let column = await Column.findOneAndUpdate({
                    _id: sectionId
                }, {
                    $set: {
                        "budget.expenses.$[expense].amount": expense.amount,
                        "budget.expenses.$[expense].reason": expense.reason,
                        "budget.expenses.$[expense]._user": expense._user,
                        "budget.expenses.$[expense].date": expense.date
                    }
                }, {
                    arrayFilters: [{ "expense._id": expense._id }],
                    new: true
                })
                .populate({ path: 'budget.expenses._user' }).lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Column project dates saved!',
                column: column
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async deleteBudgetExpense(req: Request, res: Response, next: NextFunction) {

        // Fetch the columnId and amountPlanned
        let { columnId, expenseId } = req.body;

        try {

            // Find the group and update their respective group avatar
            const column = await Column.findOneAndUpdate({
                    _id: columnId
                }, 
                { 
                $pull: {
                    'budget.expenses': { _id: expenseId }}
                }, {
                new: true
                });

            // Send status 200 response
            return res.status(200).json({
                message: 'Column project dates saved!',
                column: column
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * Saves the order of the sections in the board views
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    async updateColumnsPosition(req: Request, res: Response, next: NextFunction) {
        const { columns } = req.body;

        try {
            columns.forEach(async col => {
                await Column.findByIdAndUpdate(col._id, {
                    $set: { 'kanban_order': col.position }
                })
                .populate({ path: 'permissions._members', select: 'first_name last_name profile_pic role email' })
                .lean();
            });

            return res.status(200).json({
                message: 'Columns reordered!'
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };

    async setDisplayCustomFieldInColumn(req: Request, res: Response, next: NextFunction) {
        const { columnId, showInColumn, customFieldName } = req.body;

        try {
            let action = {};
            if (showInColumn) {
                action = {
                    $push: {'custom_fields_to_show_kanban': customFieldName }
                }
            } else {
                action = {
                    $pull: {'custom_fields_to_show_kanban': customFieldName }
                }
            }

            // Find the group and update their respective group avatar
            const column = await Column.findOneAndUpdate({
                    _id: columnId
                }, 
                    action
                , {
                new: true
                })
                .select("custom_fields_to_show_kanban")
                .populate({ path: 'permissions._members', select: 'first_name last_name profile_pic role email' })
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Column Custom Fields saved!',
                column: column
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async archive(req: Request, res: Response, next: NextFunction) {

        const { sectionId } = req.body;

        try {
            let column = await Column.findById({
                    _id: sectionId
                })
                .lean();

            if (column.archived) {
                // Unarchive Section & Posts
                // Unarchive the posts
                await Post.updateMany({
                        'task._column': sectionId
                    }, {
                        $set: {'archived': false }
                    });
                
                // Find the group and update their respective group avatar
                column = await Column.findOneAndUpdate({
                        _id: sectionId
                    }, {
                        $set: { archived: false }
                    }, {
                        new: true
                    })
                    .populate({ path: 'budget.expenses._user' })
                    .populate({ path: 'permissions._members', select: 'first_name last_name profile_pic role email' })
                    .lean();

            } else {
                // Archive Section & Posts
                // Duplicate the section
                let newColumn = column;
                delete newColumn._id;
                newColumn.archived = true;
                newColumn.title = column.title + ' ' + moment().format('YYYY-MM-DD');
                newColumn = await Column.create(newColumn);

                // Update the post to the new duplicated section
                await Post.updateMany({
                        'task._column': sectionId
                    }, {
                        $set: {
                            'archived': true,
                            'task._column': newColumn._id
                        }
                    });
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'Column Custom Fields saved!',
                column: column
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    // get the cost of all the timetracking linked to the task in the section
    async getSectionTimeTrackingCost(req: Request, res: Response, next: NextFunction) {
        try {
            // Fetch GroupId from the query
            const { sectionId } = req.params;

            let totalCost = 0;

            if (sectionId) {
                const tasks = await Post.find({
                        'task._column': sectionId
                    }).select('_id').lean();

                const timeTrackingEntities = await TimeTrackingEntity.find({
                        _task: { $in: tasks }
                    })
                    .lean();

                for (let i = 0; i < timeTrackingEntities?.length; i++) {
                    for (let j = 0; j < timeTrackingEntities[i]?.times?.length; j++) {
                        totalCost += (timeTrackingEntities[i]?.times[j]?.cost || 0)
                    }
                }
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Cost obtained Successfully!',
                time_tracking_cost: totalCost
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }
}