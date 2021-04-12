import { Response, Request, NextFunction } from "express";
import { sendError } from "../senderror";
import { File } from '../../api/models';

const fs = require("fs");

/**
 * This function is the boiler plate for file handler mechanism for group avatar
 * @param req 
 * @param res 
 * @param next 
 */
const groupFileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // Fetch the File Name From the request
    let { params: { file } } = req;

    // Redirect the Response to the Groups Microservice
    return res.status(301).redirect(`${process.env.GROUPS_SERVER}/uploads/${file}`)

  } catch (err) {
    return sendError(res, err, 'Internal Server Error!', 500);
  }
}

/**
 * This function is the boiler plate for file handler mechanism for files
 * @param req 
 * @param res 
 * @param next 
 */
const groupFileUploader = async (req: Request, res: Response, next: NextFunction) => {

  req.body.fileData = JSON.parse(req.body.fileData);

  if (!req.files) {
    next();
  } else {

    /// Instantiate the fileName variable and add the date object in the name
    let fileName: any = Date.now().toString() + "_" + req['files'].file['name'];

    // Get the file from the request
    const file: any = req['files'].file;

    // Get the folder link from the environment
    let folder = '';
    if (req.body.fileData._workspace) {
      folder += req.body.fileData._workspace +  '/';

      if (req.body.fileData._group) {
        folder += req.body.fileData._group +  '/';

        if (req.body.fileData._folder) {
          folder += req.body.fileData._folder + '/';
        }
      }
    }

    await fs.mkdir(process.env.FILE_UPLOAD_FOLDER + folder, { recursive: true }, function(error) {
      if (error) {
        fileName = null;
        return res.status(500).json({
          status: '500',
          message: 'file upload error',
          error: error
        });
      }
    })

    // Modify the file accordingly and handle request
    file.mv(process.env.FILE_UPLOAD_FOLDER + folder + fileName, (error) => {
      if (error) {
        fileName = null;
        return res.status(500).json({
          status: '500',
          message: 'file upload error',
          error: error
        });
      }

      // Modify the file and serialise the object
      const file = {
        original_name: req['files'].file['name'],
        modified_name: folder + fileName
      };

      // Modify the current request to add 
      req.body.fileData.original_name = file.original_name;
      req.body.fileData.modified_name = file.modified_name;

      // Pass the middleware// Pass the middleware
      next();
    });
  }

}

/**
 * This function is the boiler plate to delete the file for files
 * @param req 
 * @param res 
 * @param next 
 */
const groupFileDelete = async (req: Request, res: Response, next: NextFunction) => {

  const { fileId } = req.params;
  let deletedFile: any = await File.findById({ _id: fileId });
  
  if (req.body.fileName && req.body.fileName != '' && deletedFile.type == 'file') {
    // Delete the file accordingly and handle request
    fs.unlink(process.env.FILE_UPLOAD_FOLDER + req.body.fileName, (error) => {
      if (error) {
        req.body.fileName = null;
        return res.status(500).json({
          status: '500',
          message: 'file upload error',
          error: error
        });
      }

      // Pass the middleware// Pass the middleware
      next();
    });
  } else {
    next();
  }

}

export { groupFileHandler, groupFileUploader, groupFileDelete }
