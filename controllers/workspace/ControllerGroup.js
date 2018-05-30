const Group = require('../../models/group');
const User = require('../../models/user');
module.exports = {

    searchWorkspaceUsers(req, res, next) {
        const key_word = req.params.key_word;
        const workspace = req.params.workspace_id;
        let regex = new RegExp(key_word, 'i');
        User.aggregate([{
                    $project: {
                        fullname: {
                            $concat: ['$first_name', ' ', '$last_name']
                        },
                        doc: '$$ROOT',
                        "_workspace": workspace
                    },

                }, {
                    $match: {
                        fullname: regex,
                    }

                }],

                /* {"_workspace": workspace
                               } */
                /*  {
                       $or: [{
                          "first_name": {
                              "$regex": key_word,
                              "$options": "i"
                          },
                          "last_name": {
                              "$regex": key_word,
                              "$options": "i"
                          }
                      }],
                      "_workspace": workspace 
                 } */
            )

            .then((users) => {
                res.status(200).json({
                    message: "search successfull!",
                    users: users
                });
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Error! something went wrong | internal server error",
                    err
                });
            })

        console.log("this is search user contoller");
    },
    /*  searchGroupUsers(req, res, next) {
         const key_word = req.params.key_word;
         const workspace = req.params.workspace;
         let regex = new RegExp(key_word, 'i');
         User.aggregate([{
                     $project: {
                         fullname: {
                             $concat: ['$first_name', ' ', '$last_name']
                         },
                         doc: '$$ROOT',
                         "_workspace": workspace
                     },

                 }, {
                     $match: {
                         fullname: regex,
                     }

                 }],

                
             )

             .then((users) => {
                 res.status(200).json({
                     message: "search successfull!",
                     users: users
                 });
             })
             .catch((err) => {
                 res.status(500).json({
                     message: "Error! something went wrong | internal server error",
                     err
                 });
             })

         console.log("this is search user contoller");
     }, */

    // temp method for group user's searching 
    searchGroupUsers(req, res, next) {
        // const key_word = req.params.key_word;
        const group = req.params.group_id;

        Group.find({
                _id: group
            })
            .populate('_members', 'first_name last_name')
            .populate('_admins', 'first_name last_name')
            .then((group) => {


                // const members = group._admins;
                res.status(200).json({
                    message: "group found successfully!",
                    group: group
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
    }

}