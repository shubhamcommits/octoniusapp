const path = require('path');
module.exports = {
    downloadFile(req, res, next) {
        console.log("=============File Download Controller=============");

        const fileName = req.body.fileName;
        filepath = path.join(__dirname, '../uploads') + '/' + fileName;
        res.sendFile(filepath);
    }
}