const Workspace = require("../../models/workspace")
const User = require("../../models/user")
const Auth = require("../../models/auth")
const bcrypt = require("bcrypt");
const helper_password = require("../../helpers/password");
const jwt = require('jsonwebtoken');



module.exports = {

    // creating new workspace and new user with owner rights
    createNewWorkSpace(req, res, next) {

        console.log("--------Creating New Workspace Api--------");
        // generating hash password fist
        helper_password.encryptPassword(req.body.owner_password)
            .then((hashPassword) => {

                let new_workspace = req.body;
                new_workspace.owner_password = hashPassword.password;
                // creating new workspace
                Workspace.create(new_workspace)
                    .then((workspace) => {

                        let new_user = {
                            first_name: req.body.owner_first_name,
                            last_name: req.body.owner_last_name,
                            email: req.body.owner_email,
                            password: hashPassword.password,
                            workspace_name: req.body.workspace_name,
                            company_name: req.body.company_name,
                            _workspace: workspace,
                            role: 'owner'
                        }
                        // creating new user with owner rights
                        User.create(new_user)
                            .then((user) => {
                                // updating  memebers and _owener fields of workspace
                                Workspace.findByIdAndUpdate({
                                        _id: workspace._id
                                    }, {
                                        $set: {
                                            _owner: user,
                                        },
                                        $push: {
                                            members: user
                                        }
                                    }, {
                                        new: true
                                    })
                                    .then((updated_workspace) => {

                                        // generating jsonwebtoken 
                                        const payload = {
                                            subject: user._id
                                        };
                                        const token = jwt.sign(payload, process.env.JWT_KEY);

                                        // initialition new auth record 
                                        let new_auth = {
                                            workspace_name: workspace.workspace_name,
                                            _user: user,
                                            token: token
                                        }
                                        // creating new auth record
                                        Auth.create(new_auth)
                                            .then((auth) => {
                                                // everything is correct,user can create new workspace
                                                res.status(200).json({
                                                    message: "workspace created successfully!",
                                                    token: token,
                                                    user: user
                                                });
                                            })
                                            // auth creation error
                                            .catch((err) => {
                                                res.status(500).json({
                                                    message: "something went wrong | internal server error",
                                                    error: err
                                                });
                                            })
                                    })
                                    // workspace update error
                                    .catch((error) => {
                                        res.status(500).json({
                                            message: "something went wrong | internal server error occured",
                                            error: error
                                        });
                                    })
                            })
                            // user creation error 
                            .catch((err) => {
                                res.status(500).json({
                                    message: "something went wrong | internal server error occured",
                                    error: err
                                });
                            });

                    })
                    // workspace creation error
                    .catch((err) => {
                        res.status(500).json({
                            message: "something went wrong | internal server error occured",
                            error: err
                        });
                    });
            })
            // password encryption error
            .catch((err) => {
                return res.status(403).json({
                    message: "something went wrong with your password, Please try another one",
                    error: err.message
                });
            })
    },

    getWorkspace(req, res, next) {
        let workspace_id = req.params.workspace_id;
        Workspace.findOne({
                _id: workspace_id
            })
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
    }
}