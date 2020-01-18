const Workplace = require('./../models/workspace.model');
const Group = require('./../models/group.model');


const externalServiceUtil = {
    async getGroupsNumberForWorkplace(workspaceId) {
        return await Group.countDocuments({
            "_workspace": workspaceId
        });
    },

    async getAllWorkplaces() {
        return await Workplace
            .find()
            .select('company_name owner_first_name owner_last_name owner_email members workspace_name created_date');
    },

    async getAllWorkplacesWithGroups() {
        const workplaces = await (this.getAllWorkplaces());
        return await Promise.all(workplaces.map(async workplace => {
            return {groupsNumber: await this.getGroupsNumberForWorkplace(workplace._id), ...workplace._doc}
        }))

    }
};

const externalService = {
    async getAllWorkplaces(req, res) {
        try {
            return res.status(200).json(await externalServiceUtil.getAllWorkplacesWithGroups());
        } catch (e) {
            res.status(500).json({message: 'Failed to get all workspaces'});
        }
    }
};

module.exports = externalService;
