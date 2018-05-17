const Group = require("../../models/group");

module.exports = {



    createNewGroup(req, res, next) {
        let new_group = req.body;

        Group.findOne({
                group_name: new_group.group_name,
                _workspace: new_group._workspace
            })
            .then((group) => {

                if (group !== null) {
                    res.status(409).json({
                        message: "Group Name has alredy taken,Please choose another one",
                    })
                } else {
                    Group.create(new_group)
                        .then((group) => {
                            res.status(200).json({
                                message: "Group Created Successfully!",
                                group: group
                            })
                        })
                        // group creating error
                        .catch((err) => {
                            res.status(500).json({
                                message: "something went wrong | internal server error",
                                err
                            })
                        })
                }
            })
            // group finding error
            .catch((err) => {
                res.status(500).json({
                    message: "something went wrong | internal server error",
                    err
                })
            })
    },
    getUserGroups(req, res, next) {
        let user_id = req.params.user_id;
        let workspace_id = req.params.workspace_id;

        Group.find({
                _workspace: workspace_id,
                '_members._user': user_id
            })
            .populate('_members')
            .then((groups) => {

                if (groups == null) {
                    return res.status(404).json({
                        message: "Error! invalid workspace id or user id",
                    })
                } else {
                    res.status(200).json({
                        message: "Groups found successfully!",
                        groups: groups
                    })
                }

            })
            // groups finding error
            .catch((err) => {
                res.status(500).json({
                    message: "something went wrong | internal server error",
                    err
                })
            })
    }
}