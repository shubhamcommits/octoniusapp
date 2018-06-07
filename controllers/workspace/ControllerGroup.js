const Group = require('../../models/group');
const User = require('../../models/user');
module.exports = {



    /*     searchGroupUsers(req, res, next) {
            const key_word = req.params.key_word;
            const group_id = req.params.group_id;

            Group.findOne({
                    _id: group_id
                })
                .populate('_members _admins', 'first_name last_name')
                .then((group) => {
                    res.status(200).json({
                        message: "search successfull!",
                        users: group._members.concat(group._admins)
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        message: "Error! something went wrong | internal server error",
                        err
                    });
                })

        },
     */
    // temp method for group user's searching 
    searchGroupUsers(req, res, next) {
        const query = req.params.query;
        const group = req.params.group_id;

        User.find({
                _groups: group,
                full_name: {
                    $regex: new RegExp(query, 'i')
                }
            })

            .then((users) => {

                // const members = group._admins;
                res.status(200).json({
                    message: "users found successfully!",
                    users: users
                });

            })
            .catch((err) => {
                res.status(500).json({
                    message: "Error! something went wrong | internal server error",
                    err
                });
            })

    },
    getUserGroup(req, res, next) {

        const group_id = req.params.group_id;

        Group.findOne({
                _id: group_id
            })
            .populate('_members', 'first_name last_name')
            .populate('_admins', 'first_name last_name')
            .then((group) => {
                if (group == null) {
                    res.status(404).json({
                        message: "Error! group not found,Invalid group id"
                    });
                } else {
                    res.status(200).json({
                        message: "group found successfully!",
                        group: group
                    });
                }
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Error! something went wrong | internal server error",
                    err
                });
            });
    },

    addNewUsersInGroup(req, res, next) {
        let group = req.body.group;
        let members = req.body.members;
        let _members = members.map(result => {
            return result._id;
        });

        Group.findByIdAndUpdate({
                _id: group
            }, {
                $addToSet: {
                    _members: _members
                }
            }, {
                new: true
            })
            .then((updated_group) => {
                User.updateMany({
                        _id: _members
                    }, {
                        $addToSet: {
                            _groups: group
                        }
                    })
                    .then((updated_users) => {
                        res.status(200).json({
                            message: "Group Data has updated successfully!",
                            group: updated_group
                        });

                    })
                    .catch((err) => {
                        res.status(500).json({
                            message: "Error! something went wrong | internal server error",
                            err
                        });
                    })
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Error! something went wrong | internal server error",
                    err
                });
            })
    }

}