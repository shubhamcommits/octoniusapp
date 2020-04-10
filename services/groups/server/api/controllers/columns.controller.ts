import { Request, Response, NextFunction } from 'express';
import { Column } from '../models';
import { sendError } from '../../utils';

export class ColumnsController {
    // initialize the basic columns

    async initColumns(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch GroupId from the request
            const { groupId } = req.body;

            const groupColumns = new Column({
                groupId: groupId
            });
            await Column.findOne({
                groupId: groupId
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

    // get all existing columns

    async getAllColumns(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch GroupId from the query
            const { groupId } = req.query;

            await Column.findOne({
                groupId: groupId
            }, (err, col) => {
                if (err) {
                    return res.status(200).json({ "err": "Error in recieving columns" });
                } else {
                    return res.status(200).json(col);
                }
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // get one column

    async getOneColumn(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.groupId;
            const columnName = req.params.columnName;
            await Column.findOne({
                groupId: id,
                columns: {
                    "$elemMatch": {
                        title: columnName
                    }
                }
            }, (err, col) => {
                if (err) {
                    return res.status(200).json({ "err": "Error in recieving columns" });
                } else {
                    return res.status(200).json(col);
                }
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // add a new column

    async addColumn(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.body.groupId;
            const columnName = req.body.columnName;
            const update = {
                $addToSet: {
                    columns: {
                        title: columnName,
                        taskCount: 0
                    }
                }
            };
            await Column.update({
                groupId: id
            }, update, (err, col) => {
                if (err) {
                    return res.status(200).json({ "err": "Error in updating columns" });
                } else {
                    return res.status(200).json(col);
                }
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // edit column name 

    async editColumnName(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.body.groupId;
            const oldColumnName = req.body.oldColumnName;
            const newColumnName = req.body.newColumnName;
            const update = {
                "$set": {
                    "columns.$.title": newColumnName
                }
            };
            await Column.findOne({
                groupId: id,
                columns: {
                    "$elemMatch": {
                        title: newColumnName
                    }
                }
            }, (err, col) => {
                if (err) {
                    return res.status(200).json({ "err": "Error in updating columns" });
                } else if (!col) {
                    Column.update({
                        groupId: id,
                        columns: {
                            "$elemMatch": {
                                title: oldColumnName
                            }
                        }
                    }, update, (err, col) => {
                        if (err) {
                            return res.status(200).json({ "err": "Error in updating columns" });
                        } else {
                            return res.status(200).json(col);
                        }
                    });
                } else if (col) {
                    return res.status(200).json({ "err": "Column already exists" });
                }
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }


    // edit number of tasks

    async editColumnTaskNumber(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.body.groupId;
            const columnName = req.body.columnName;
            const numberOfTasks = req.body.numberOfTasks;
            const update = {
                "$set": {
                    "columns.$.taskCount": numberOfTasks
                }
            };
            await Column.update({
                groupId: id,
                columns: {
                    "$elemMatch": {
                        title: columnName
                    }
                }
            }, update, (err, col) => {
                if (err) {
                    return res.status(200).json({ "err": "Error in updating columns" });
                } else {
                    return res.status(200).json(col);
                }
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // add task to column

    async columnTaskInc(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.body.groupId;
            const columnName = req.body.columnName;
            const update = {
                "$inc": {
                    "columns.$.taskCount": 0.5
                }
            };
            await Column.update({
                groupId: id,
                columns: {
                    "$elemMatch": {
                        title: columnName
                    }
                }
            }, update, (err, col) => {
                if (err) {
                    return res.status(200).json({ "err": err });
                } else {
                    return res.status(200).json(col);
                }
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // remove task from column

    async columnTaskDec(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.body.groupId;
            const columnName = req.body.columnName;
            const update = {
                "$inc": {
                    "columns.$.taskCount": -0.5
                }
            };
            await Column.update({
                groupId: id,
                columns: {
                    "$elemMatch": {
                        title: columnName
                    }
                }
            }, update, (err, col) => {
                if (err) {
                    return res.status(200).json({ "err": err });
                } else {
                    return res.status(200).json(col);
                }
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    // delete column 

    async deleteColumn(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.body.groupId;
            const columnName = req.body.columnName;
            const update = {
                $pull: {
                    columns: {
                        title: columnName
                    }
                }
            };
            await Column.update({
                groupId: id
            }, update, (err, col) => {
                if (err) {
                    return res.status(200).json({ "err": "Error in updating columns" });
                } else {
                    return res.status(200).json(col);
                }
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

}