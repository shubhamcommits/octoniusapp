const Workplace = require('./../models/workspace.model');

const externalService = {
    async getAllWorkplaces(req, res) {
        try {
            return res.status(200).json(await Workplace.find());
        } catch (e) {
            res.status(500).json({message: 'Failed to get all workspaces'});
        }
    }
};

module.exports = externalService;
