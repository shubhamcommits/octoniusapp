const Workspace = require('../models/workspace');
module.exports = {

    isInvitedUser(req, res, next) {
        let invited_user_email = req.body.email;
        Workspace.findOne({
                workspace_name: req.body.workspace_name,
            })
            .then((workspace) => {
                if (workspace == null) {
                    next();
                } else {
                    for (let i = 0; i < workspace.invited_users.length; i++) {

                        if (workspace.invited_users[i].email === invited_user_email) {
                            req.user_role = workspace.invited_users[i].role;
                            next();
                        }
                         if ((i + 1) == workspace.invited_users.length) {
                             next();
                         }
                    }
                }
            })
            .catch((err) => {
                 res.status(404).json({
                    message: "Error! workspace name is invalid or your email is not allowed to join this workspace",
                    err
                });
            })
    }

}