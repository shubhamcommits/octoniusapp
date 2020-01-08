const Workplace = require('./../models/workspace.model');

const headerExternalKey = "HEADERIDSHAREDFOROCTONIUS";


const externalService = {
    async getAllWorkplaces(req, res) {
        try {
            if(req.headers.externalkey === headerExternalKey) {
                return res.status(200).json(await Workplace.find());
            } else {
                res.status(404).json({
                    message: '404 not found'
                });
            }

        } catch (e) {
            res.status(500).json({message: 'Failed to get all workspaces'});
        }
    }
};

module.exports = externalService;
