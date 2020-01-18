const { externalService } = require('./../services/index');

const externalController = {

    async getAllWorkplaces(req, res) {
        return await externalService.getAllWorkplaces(req, res);
    }
};

module.exports = externalController;
