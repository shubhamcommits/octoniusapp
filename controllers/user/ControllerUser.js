const User = require("../../models/user");
const path = require("path");
module.exports = {

    getUser(req, res, next) {
        let userId = req.userId;

        User.findOne({
                _id: userId
            })
            .select('_id first_name last_name profile_pic email workspace_name bio company_join_date current_position role phone_number mobile_number company_name _workspace')
            .then((user) => {
                // user not found error
                if (user == null) {
                    res.status(404).json({
                        message: "Error! User not found, invalid id or unauthorized request"
                    });
                } else {
                    res.status(200).json({
                        message: "User has found successfully!",
                        user: user
                    });
                }
            })
            // user finding error
            .catch((err) => {
                res.status(500).json({
                    message: "something went wrong | interval server error",
                    err
                });
            })


    },

    updateUser(req, res, next) {
        // let userId = req.userId;
        let userId = req.userId;
        let user = req.body;

        delete req.body.userId

        User.findByIdAndUpdate({
                _id: userId
            }, {
                $set: user
            }, {
                new: true
            })
            .then((updated_user) => {
                res.status(200).json({
                    message: "Your Profile has been Updated Successfully!",
                    user: updated_user
                });
            })
            .catch((err) => {
                res.status(500).json({
                    message: "something went wrong | interval server error",
                    err
                });
            })

    },


    updateUserImage(req, res, next) {

        console.log("=============Update Users Profile Image=============");


        User.findByIdAndUpdate({
                _id: req.userId
            }, {
                profile_pic: req.fileName
            }, {
                new: true
            })
            .then((updated_user) => {

                res.status(200).json({
                    message: "User Profile has been updating successfully!",
                    user: updated_user
                });

            })
            .catch((err) => {
                res.status(500).json({
                    message: "something went wrong | interval server error",
                    err
                });
            })

    }

}