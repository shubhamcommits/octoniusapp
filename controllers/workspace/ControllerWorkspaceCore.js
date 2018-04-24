const Workspace = require("../../models/workspace")
const User = require("../../models/user")
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
                                            members: {
                                                _user: user
                                            }
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

                                        res.status(200).json({
                                            message: "workspace created successfully!",
                                            token: token,
                                        });
                                    })
                                    .catch((error) => {
                                        res.status(500).json({
                                            message: "internal server error occured",
                                            error: error
                                        });
                                    })
                            }).catch((err) => {
                                res.status(500).json({
                                    message: "internal server error occured",
                                    error: err
                                });
                            });

                    }).catch((err) => {
                        res.status(500).json({
                            message: "internal server error occured",
                            error: err
                        });
                    });
            })
            .catch((err) => {
                return res.status(403).json({
                    message: "something went wrong with your password, Please try another one",
                    error: err.message
                });
            })
    }

}