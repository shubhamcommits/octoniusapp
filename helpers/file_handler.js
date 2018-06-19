const uploadFile = require('express-fileupload');

module.exports = (req, res, next) => {

    console.log("================= FILE HANDLER ==================");





    let fileName = Date.now().toString() + req.files.profileImage.name;
    let file = req.files.profileImage;
    // const server_address = '/home/ubuntu/tutor_server/uploads/';
    const local_address = './uploads/';


    file.mv(local_address + fileName, (err) => {
        if (err) {
            fileName = null;
            return res.status(500).json({
                status: "500",
                message: "file upload error",
                error: err
            });
        }
        req.fileName = fileName;
        next();
    });



}