const express = require('express');

const { columns } = require('../controllers');

const router = express.Router();

// get all existing columns
router.get('/all/:groupId',columns.getAllColumns);

// initialize the basic columns
router.post('/init/',columns.initColumns);

// get one column
router.get('/column/:groupId/:columnName',columns.getOneColumn);

// add a new column
router.post('/add',columns.addColumn);

// edit column name 
router.put('/edit/name',columns.editColumnName);

// edit number of tasks
router.put('/edit/number',columns.editColumnTaskNumber);

// delete column 
router.put('/delete',columns.deleteColumn);

module.exports = router;