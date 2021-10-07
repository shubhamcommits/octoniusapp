
const fs = require('fs');
function createUploadFolder(req, res, next) {
    if(!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads')
    }
    next()
}

export { createUploadFolder}