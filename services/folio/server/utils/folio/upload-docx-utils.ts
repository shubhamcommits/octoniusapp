
const fs = require('fs');
const path = require('path');
const libre = require('./libreoffice');

const createHtml = async ( file_uri, res, toFormate="html:HTML:EmbedImages", deleteFile=true) => {
    const docxFile = "./uploads/"+path.parse(file_uri).name+".docx";
    const file = fs.readFileSync(docxFile);
    libre.convert(file, toFormate, undefined, (err, done) => {
        if (err) {
          console.log(`Error converting file: ${err}`);
          res.send(err);
        }
        else res.json({
            message: done.toString(),
            messages: "Temp"
        });
        if(deleteFile) {
                        fs.unlinkSync(docxFile);
                    }
    });
}

function createUploadFolder(req, res, next) {
    if(!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads')
    }
    next()
}

export {createHtml, createUploadFolder}