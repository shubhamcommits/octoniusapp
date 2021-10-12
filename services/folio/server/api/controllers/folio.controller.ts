import createHtml from '../../utils/folio/convert-to-html';
const path = require('path');
const multipart = require('connect-multiparty');
const fs = require('fs');

const multipartMiddleware = multipart({
    uploadDir: process.env.FILE_UPLOAD_FOLDER
});

const uploadcontroller = async (req: any, res) =>{
  let file_path = "";
  if ( req.files.uploads.length >= 1 ) {
    file_path = path.resolve(req.files.uploads[0].path);
  }

  const htmlData = await createHtml(file_path);

  return res.status(200).json({
    message: 'Html conversion success!',
    folio: htmlData
  });
}

function createUploadFolder(req, res, next) {
    if(!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads')
    }
    next()
}

export default { createUploadFolder, uploadcontroller, multipartMiddleware };