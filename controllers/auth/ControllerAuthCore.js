const User = require("../../models/user");
const Workspace = require("../../models/workspace");
const helper_password = require("../../helpers/password");
const jwt = require("jsonwebtoken");

module.exports = {

    signin(req, res, next) {
        console.log("--------Workspace Sign in Controller Api---------");

        let login_user = req.body;

        User.findOne({
                workspace_name: login_user.workspace_name,
                email: login_user.email
            })
            .then((user) => {

                if (user == null) {
                    res.status(401).json({
                        message: "Auth failed,Invalid Wrokspace name or user email!",
                    });

                } else {

                    let plainPassword = req.body.password;

                    helper_password.decryptPassword(plainPassword, user.password)
                        .then((response) => {
                            if (response.password == true) {
                                // generating jsonwebtoken 
                                const payload = {
                                    subject: user._id
                                };
                                const token = jwt.sign(payload, process.env.JWT_KEY);

                                res.status(200).json({
                                    message: "user has signed in successfully!",
                                    token: token,
                                });
                            } else {
                                res.status(401).json({
                                    message: "Auth failed,Invalid email or password!",
                                    password: response.password
                                });
                            }

                        })
                        .catch((error) => {
                            res.status(401).json({
                                message: "Auth failed,Invalid email or password!",
                            });
                        });
                }
            })
            .catch((error) => res.status(500).json({
                message: "something went wrong | internal server error",
                error: error
            }))

    },

    // new user signup on existing workspace
    signup(req, res, next) {
        console.log("----------Workspace Sign up Controller Apis----------");

        let user_data = req.body;
        let user_email_domain = req.body.email.split("@")[1];

        // checking wroksapce existance and verifying user's email domain is allowed to join the workspace
        Workspace.findOne({
                workspace_name: user_data.workspace_name,
                allowed_domains: user_email_domain
            })
            .then((workspace) => {
                // if workspace does not exist
                if (workspace == null) {
                    return res.status(404).json({
                        message: "Error! workspace name is invalid or your email is not allowed to join this workspace"
                    });
                    // workspace exists and also user can join the workspace
                } else {
                    //encrypting user password
                    helper_password.encryptPassword(user_data.password)
                        .then((response) => {
                            user_data.password = response.password;
                            user_data._workspace = workspace;
                            // creating new user 
                            User.create(user_data)
                                .then((user) => {
                                    // updating workspace's memebers list wih new user
                                    Workspace.findByIdAndUpdate({
                                            _id: workspace._id
                                        }, {
                                            $push: {
                                                members: {
                                                    _user: user
                                                }
                                            }
                                        }, {
                                            new: true
                                        })
                                        .then((updated_workspace) => {
                                            // generating new token
                                            const payload = {
                                                subject: user._id
                                            };
                                            const token = jwt.sign(payload, process.env.JWT_KEY);
                                            // everything is corrent and now user can signup on workspace
                                            res.status(200).json({
                                                message: "Congratulations! you are now member of our workspace.",
                                                token: token
                                            });

                                        })
                                        // workspace updating error
                                        .catch((err) => {
                                            res.status(500).json({
                                                message: "something went wrong | Internal server error",
                                                error: err
                                            });
                                        })
                                })
                                // user creating error
                                .catch((err) => {
                                    res.status(500).json({
                                        message: "something went wrong at user signup | Internal server error",
                                        error: err
                                    });
                                })
                        })
                        // password encryption error
                        .catch((err) => {
                            res.status(401).json({
                                message: "something went wrong with your password,try another password",
                                error: err.message
                            });
                        })
                }
            })
            // workspace finding error
            .catch((error) => res.status(500).json({
                message: "something went wrong | internal server error",
                error
            }))

    },
    // checking the wrokspace name availbility
    SearchWorkspaceNameAvailablity(req, res, next) {
        let workspace_data = req.body;
        console.log(workspace_data);

        Workspace.findOne({
                workspace_name: workspace_data.workspace_name
            })
            .then((workspace) => {
                // workspace does not found
                if (workspace == null) {

                    res.status(200).json({
                        message: "workspace name is available.",
                        workspace
                    });
                }
                // if workspace alread exists 
                else {
                    res.status(409).json({
                        message: "workspace name has already been taken,Please pick another name."
                    });
                }
            })
            .catch((error) => res.status(500).json({
                message: "something went wrong | internal server error",
                error
            }))
    },

    // checking either user can join the workspace or he is already member of that workspace
    SearchUserAvailability(req, res, next) {
        let user_data = req.body;


        Workspace.findOne({
                workspace_name: user_data.workspace_name
            })
            .then((workspace) => {
                // if workspace does not exists
                if (workspace == null) {
                    return res.status(401).json({
                        message: "Error! Invalid workspace name"
                    })

                } else {
                    User.findOne({
                            workspace_name: user_data.workspace_name,
                            email: user_data.email
                        })
                        .then((user) => {
                            // if user is not the member of workspace now he/she can signup
                            if (user == null) {
                                res.status(200).json({
                                    message: "user can sign up with this email and workspace name"
                                });
                            } else {
                                // if user alredy member of workspace then he can not signup again
                                res.status(409).json({
                                    message: "you are already member of this workspace,go for sign in."
                                });
                            }
                        })
                        // user find error
                        .catch((error) => {
                            res.status(500).json({
                                message: "something went wrong | internal server error",
                                error
                            });
                        })
                }
            })
            // workspace find error
            .catch((error) => {
                res.status(500).json({
                    message: "something went wrong | internal server error",
                    error
                });
            })
    }


}