import createHtml from '../../utils/folio/convert-to-html';
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: process.env.FILE_UPLOAD_FOLDER
});

const uploadcontroller = async (req: any, res) =>{
  let file_path = "";
  if ( req.files.uploads.length >= 1 ) {
    file_path = req.files.uploads[0].path;
  }
console.log("1.- " + file_path);
  const htmlData = await createHtml(file_path);

  return res.status(200).json({
    message: 'Html conversion success!',
    folio: htmlData
  });
}

export default {uploadcontroller, multipartMiddleware};