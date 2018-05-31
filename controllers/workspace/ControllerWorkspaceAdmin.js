const Wrokspace = require("../../models/workspace");
const User = require("../../models/user");
const Post = require("../../models/post");
var nodemailer = require('nodemailer');


module.exports = {


    updateAllowedEmailDomains(req, res, next) {
        let workspace_id = req.body.workspace_id;
        let allowed_domains = req.body.domains.split(',').map(function (e) {
            return e.trim();
        });
        // adding new doamins and preventing to add duplicate values
        Wrokspace.findByIdAndUpdate({
                _id: workspace_id
            }, {
                $addToSet: {
                    allowed_domains: allowed_domains
                }
            }, {
                new: true
            })
            .then((updated_workspace) => {

                if (updated_workspace == null) {
                    res.status(404).json({
                        message: "Invalid workspace id error,workspace not found.",
                    });
                } else {
                    res.status(200).json({
                        message: "Domains data has Updated successfully",
                        doamins: allowed_domains
                    })
                }
            })
            .catch((error) => {

                res.status(500).json({
                    message: "something went wrong | internal server error",
                    error
                })

            })
    },

    inviteUserViaEmail(req, res, next) {
        let workspace_id = req.body.workspace_id;
        let invited_user_email = req.body.email;
        Wrokspace.findByIdAndUpdate({
                _id: workspace_id
            }, {
                $push: {
                    invited_users: {
                        email: invited_user_email,
                    }
                }
            }, {
                new: true
            })
            .then((updated_workspace) => {
                if (updated_workspace == null) {
                    res.status(404).json({
                        message: "Error! workspace not found, invalid workspace id"
                    });
                } else {
                    let sender = 'dev@octonius.com';
                    let receiver = invited_user_email;
                    // nodemailer configrations 
                    var transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: sender,
                            pass: 'Yaiza13@'
                        }
                    });

                    // nodemailer configurations
                    var mailOptions = {
                        from: sender,
                        to: receiver,
                        subject: 'Workspace invitation request',
                        text: `workspace name "${updated_workspace.workspace_name}"
                        "http://localhost:3000/#/signup" Click on the link to Join the worksapce`
                    };
                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            res.status(404).json({
                                status: "404",
                                message: "Error! Invalid email id",
                                error: err
                            })
                        } else {
                            res.status(200).json({
                                message: "Invitation has sent successfully!",
                                workspace: updated_workspace
                            });
                        }
                    });


                }
            })
            .catch((err) => {
                res.status(500).json({
                    message: "soemthing went wrong | internal server error!",
                    err
                })
            })

    },
    updateUserRole(req, res, next) {
        let user_id = req.body.user_id;
        let role = req.body.role;

        User.findByIdAndUpdate({
                _id: user_id
            }, {
                role: role
            }, {
                new: true
            })
            .then((user) => {
                res.status(200).json({
                    message: "User role has been updated successfully!",
                });

            })
            .catch((err) => {
                res.status(500).json({
                    message: "something went wrong | internal server error",
                    err
                });
            })

    },

    deleteWorkspaceUser(req, res, next) {

        let user_id = req.body.user_id;
        Post.remove({
                _posted_by: user_id
            })
            .then((res) => {
                res.status(200).json({
                    message: "posts removed successfully!",
                    err
                });
            })
            .catch((err) => {
                res.status(500).json({
                    message: "something went wrong | internal server error",
                    err
                });

            })

    }
}