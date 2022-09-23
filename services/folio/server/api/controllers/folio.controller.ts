import { Response, Request, NextFunction } from 'express';
import { File } from '../../models/file.model';
import { sendError } from '../../utils/senderror';
//import createHtml from '../../utils/folio/convert-to-html';

const path = require('path');
const multipart = require('connect-multiparty');
const fs = require('fs');

/*
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
*/

async function displayHeadings(req: Request, res: Response, next: NextFunction) {
  try {
    // Fetch the publish From the request
    let { body: { showHeadings } } = req;
    
    // Fetch the fileId From the request
    const { fileId } = req.params;

    let folioUpdated = await File.findOneAndUpdate(
      { _id: fileId },
      { $set: {show_headings: showHeadings }},
      { new: true}).lean();

    // Send Status 200 response
    return res.status(200).json({
        message: 'Folio updated',
        folio: folioUpdated
    });
  } catch (err) {
      return sendError(res, err, 'Internal Server Error!', 500);
  }
}

async function displayComments(req: Request, res: Response, next: NextFunction) {
  try {
    // Fetch the publish From the request
    let { body: { showHeadings } } = req;
    
    // Fetch the fileId From the request
    const { fileId } = req.params;

    let folioUpdated = await File.findOneAndUpdate(
      { _id: fileId },
      { $set: {show_comments: showHeadings }},
      { new: true}).lean();

    // Send Status 200 response
    return res.status(200).json({
        message: 'Folio updated',
        folio: folioUpdated
    });
  } catch (err) {
      return sendError(res, err, 'Internal Server Error!', 500);
  }
}

export default { /*createUploadFolder, uploadcontroller, multipartMiddleware, */displayHeadings, displayComments };