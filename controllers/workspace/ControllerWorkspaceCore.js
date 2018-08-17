const Workspace = require("../../models/workspace")
const User = require("../../models/user")
const Auth = require("../../models/auth")
const bcrypt = require("bcrypt");
const helper_password = require("../../helpers/password");
const jwt = require('jsonwebtoken');



module.exports = {


    getWorkspace(req, res, next) {
        let workspace_id = req.params.workspace_id;
        Workspace.findOne({
                _id: workspace_id
            })
            .populate('members', 'first_name last_name role profile_pic email')
            .then((workspace) => {

                if (workspace == null) {
                    res.status(404).json({
                        message: "Error! workspace not found,invalid worksapce id",
                    });
                } else {
                    res.status(200).json({
                        message: "workspace found successfully!",
                        workspace: workspace
                    });
                }
            })
            .catch((err) => {
                res.status(500).json({
                    message: "something went wrong | internal server error",
                    err
                });
            })
    },
    searchWorkspaceUsers(req, res, next) {
        const query = req.params.query;
        const workspace = req.params.workspace_id;
        // let regex = new RegExp(query, 'i');
        User.find({
                _workspace: workspace,
                full_name: {
                    $regex: new RegExp(query, 'i')
                }
            })
            .limit(10)
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
    },
}