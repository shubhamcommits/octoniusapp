const externalController = require("../controllers/external.controller");
const { externalRequestHandler } = require('../../utils/index');

const express = require('express');


const router = express.Router();

router.use(externalRequestHandler.handleExternalRequest);

router.get('/workplaces', externalController.getAllWorkplaces);

module.exports = router;
