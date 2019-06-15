const { Column } = require('../models');


// initialize the basic columns

const initColumns = async (req, res) => {
    try {
        const id  =  req.body.groupId; 
        const groupColumns = new Column({
            groupId: id
        });
        await Column.findOne({ 
            groupId: id
        }, (err, col) => {
            if(err){
                res.json({"err" : "Error in recieving columns"});
            }else if(!col){
                groupColumns.save((err, success) => {
                    if(err) res.json(err);
                    else{
                        res.json(success);
                    }
                });
            }else if(col){
                res.json({"err" : "Already initialized"});
            }
        });
        
    } catch (err) {
        return sendErr(res, err);
    }
};

// get all existing columns

const getAllColumns = async (req, res) => {
    try {
        const id = req.params.groupId;
        await Column.findOne({ 
            groupId: id
        }, (err, col) => {
            if(err){
                res.json({"err" : "Error in recieving columns"});
            }else{
                res.json(col);
            }
        });
    } catch (err) {
        return sendErr(res, err);
    }
}

// get one column

const getOneColumn = async (req, res) => {
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
            if(err){
                res.json({"err" : "Error in recieving columns"});
            }else{
                res.json(col);
            }
        });
    } catch (err) {
        return sendErr(res, err);
    }
}

// add a new column

const addColumn = async (req, res) => {
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
            if(err){
                res.json({"err" : "Error in updating columns"});
            }else{
                res.json(col);
            }
        });
    } catch (err) {
        return sendErr(res, err);
    }
}

// edit column name 

const editColumnName = async (req, res) => {
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
            if(err){
                res.json({"err" : "Error in updating columns"});
            }else if(!col){
                Column.update({ 
                    groupId: id,
                    columns: { 
                        "$elemMatch": { 
                           title: oldColumnName
                        }
                    }
                }, update, (err, col) => {
                    if(err){
                        res.json({"err" : "Error in updating columns"});
                    }else{
                        res.json(col);
                    }
                });
            }else if(col){
                res.json({"err" : "Column already exists"});
            }
        });
        
    } catch (err) {
        return sendErr(res, err);
    }
}


// edit number of tasks

const editColumnTaskNumber = async  (req, res) => {
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
            if(err){
                res.json({"err" : "Error in updating columns"});
            }else{
                res.json(col);
            }
        });
    } catch (err) {
        return sendErr(res, err);
    }
}

// add task to column

const columnTaskInc = async (req, res) => {
    try{ 
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
            if(err){
                res.json({"err" : err});
            }else{
                res.json(col);
            }
        });
    } catch (err) {
        return sendErr(res,err);
    }
}

// remove task from column

const columnTaskDec = async (req, res) => {
    try{ 
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
            if(err){
                res.json({"err" : err});
            }else{
                res.json(col);
            }
        });
    } catch (err) {
        return sendErr(res,err);
    }
}

// delete column 

const deleteColumn = async (req, res) => {
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
            if(err){
                res.json({"err" : "Error in updating columns"});
            }else{
                res.json(col);
            }
        });
    } catch (err) {
        return sendErr(res, err);
    }
}

// Exports

module.exports = {
    initColumns,
    getAllColumns,
    getOneColumn,
    addColumn,
    editColumnName,
    editColumnTaskNumber,
    columnTaskInc,
    columnTaskDec,
    deleteColumn
};