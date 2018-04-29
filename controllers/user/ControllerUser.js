const User = require("../../models/user")
module.exports = {

    getUser(req, res, next) {
        let userId = req.userId;
        User.findOne({
                _id: userId
            })
            .select('_id first_name last_name email workspace_name bio company_join_date role phone_number mobile_number company_name _workspace')
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


    }

}