const uploadFile = require('express-fileupload');

module.exports = (req, res, next) => {

    console.log("=================GROUP UPDATE FILE HANDLER ==================");

    if (!req.files) {
        next();
    } else {
        const fileName = Date.now().toString() + req.files.group_avatar.name;
        const file = req.files.group_avatar;
        // const folder = '/home/ubuntu/octonius/uploads/';
        const folder = process.env.FILE_UPLOAD_FOLDER;

        file.mv(folder + fileName, (err) => {
            if (err) {
                fileName = null;
                return res.status(500).json({
                    status: "500",
                    message: "file upload error",
                    error: err
                });
            }

            req.body.group_avatar = fileName;
            next();

        });
    }


}