const uploadFile = require('express-fileupload');

module.exports = (req, res, next) => {

    console.log("=================POST FILE HANDLER ==================");


    if (!req.files) {
        next();
        req.body.files = null;

    }
    // multiple files attached with post
    else if (req.files.attachments.length > 1) {

        req.body.files = new Array();
        req.files.attachments.forEach((file_current, index) => {

            let fileName = Date.now().toString() + file_current.name;
            let file = file_current;
            // const folder = '/home/ubuntu/octonius/uploads/';
            const folder = process.env.FILE_UPLOAD_FOLDER;

            file_current.mv(folder + fileName, (err) => {
                if (err) {
                    fileName = null;
                    return res.status(500).json({
                        status: "500",
                        message: "file upload error",
                        error: err
                    });
                }
            });
            var f = {
                orignal_name: file_current.name,
                modified_name: fileName
            }

            req.body.files.push(f);

        });

        next();
    }
    // single file attached with post
    else {
        const fileName = Date.now().toString() + req.files.attachments.name;
        const file = req.files.attachments;
        // const server_address = '/home/ubuntu/octonius/uploads/';
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
            req.body.files = new Array();
            const f = {
                orignal_name: req.files.attachments.name,
                modified_name: fileName
            }

            req.body.files.push(f);
            next();
        });
    }

}