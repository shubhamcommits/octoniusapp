const externalController = require("../controllers/external.controller");

const express = require('express');


const router = express.Router();


router.get('/workplaces', externalController.getAllWorkplaces);

module.exports = router;
