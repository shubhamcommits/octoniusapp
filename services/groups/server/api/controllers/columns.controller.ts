import { Request, Response, NextFunction } from 'express';
import { Column, Flow, Post } from '../models';
import { sendError } from '../../utils';
import moment from 'moment';

export class ColumnsController {
    /*
    // initialize the basic columns
    async initColumns(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch GroupId from the request
            const { groupId } = req.body;

            const groupColumns = new Column({
                groupId: groupId
            });
            await Column.findOne({
                _group: groupId
            }, (err, col) => {
                if (err) {
                    return res.status(200).json({ "err": "Error in recieving columns" });
                } else if (!col) {
                    groupColumns.save((err, success) => {
                        if (err) return res.status(200).json(err);
                        else {
                            return res.status(200).json(success);
                        }
                    });
                } else if (col) {
                    return res.status(200).json({ "err": "Already initialized" });
                }
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    };
    */

    // get all existing columns
    async getAllColumns(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch GroupId from the query
            const { groupId } = req.query;

            const columns = await Column.find({
                _group: groupId
            }).lean() || [];

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

            // Preparing the group data
            const columnData = {
                _group: groupId,
                title: columnName,
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
            },{
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
            const id = req.body.columnId;

            await Post.deleteMany({ 'task._column': id });
            
            await Column.findOneAndDelete({_id: id});

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
            const group = await Column.updateOne({
                _id: column.columnId
            }, {
                "$set": {
                    "custom_fields_to_show": column.customFieldsToShow
                }
            }, {
                new: true
            }).select('custom_fields_to_show');

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
            const column = await Column.updateOne({
                _id: columnId
            }, {
                "$set": {
                    "project_type": projectType
                }
            }, {
                new: true
            });

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
            const column = await Column.updateOne({
                _id: columnId
            }, {
                "$set": {
                    start_date: startDate ? moment(startDate).hours(12).format('YYYY-MM-DD') : null,
                    due_date: dueDate ? moment(dueDate).hours(12).format('YYYY-MM-DD') : null,
                }
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
}