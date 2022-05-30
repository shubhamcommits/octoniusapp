import { Response, Request, NextFunction } from "express";
import { sendError } from "../senderror";
import { File, Flamingo } from '../../api/models';
import moment from 'moment';

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

const groupsFilesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // Fetch the File Name From the request
    let { params: { fileId } } = req;

    let file: any = await File.findById({ _id: fileId });

    if (!file._parent) {
      let fileVersions: any = await File.find({ _parent: fileId });

      if (fileVersions && fileVersions.length > 0) {
        fileVersions?.sort((f1, f2) => {
          if (f1.created_date && f2.created_date) {
            if (moment.utc(f1.created_date).isBefore(f2.created_date)) {
              return 1;
            } else {
              return -1;
            }
          } else {
            if (f1.created_date && !f2.created_date) {
              return 1;
            } else if (!f1.created_date && f2.created_date) {
              return -1;
            }
          }
        });

        const fileURL = `${process.env.FILE_UPLOAD_FOLDER}${fileVersions[0].modified_name}`;
        res.download(fileURL);
      }
    } else {
      // Redirect the Response to the Groups Microservice
      const fileURL = `${process.env.FILE_UPLOAD_FOLDER}${file.modified_name}`;
      res.download(fileURL);
    }
    return;

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

    // if(req.body.fileData.type == 'campaign')
    //   fileName = req['files'].file['name']

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
  
  if (req.body.fileName && req.body.fileName != '' && deletedFile && (deletedFile.type == 'file' || deletedFile.type == 'campaign')) {
    if (fs.existsSync(process.env.FILE_UPLOAD_FOLDER + req.body.fileName)) {
      // Delete the file accordingly and handle request
      fs.unlink(process.env.FILE_UPLOAD_FOLDER + req.body.fileName, (error) => {
        if (error) {
          req.body.fileName = null;
          return res.status(500).json({
            status: '500',
            message: 'Error deleting file: ' + req.body.fileName,
            error: error
          });
        }
      });
    }
  }

  // Delete the imgs from the questions of flamingos
  if (req.body.flamingoType) {
    let flamingo = await Flamingo.findOne({_file:fileId});
    flamingo = await Flamingo.populate(flamingo, [
      { path: '_questions' }
    ]);

    if (flamingo) {
      flamingo._questions.forEach(async question => {
        if (question.image_url && question.image_url != '') {
          if (fs.existsSync(process.env.FILE_UPLOAD_FOLDER + question.image_url)) {
            // Delete the file accordingly and handle request
            fs.unlink(process.env.FILE_UPLOAD_FOLDER + question.image_url, (error) => {
              if (error) {
                return res.status(500).json({
                  status: '500',
                  message: 'Error deleting image of flamingo: ' + question.image_url,
                  error: error
                });
              }
            });
          }
        }
      });
    }
  }

  let fileVersions;
  let countVersions;
  if (deletedFile && deletedFile._parent) {
    countVersions = await File.find({ _parent: deletedFile._parent }).countDocuments();
  }
  
  if ((countVersions && countVersions <= 1) || !deletedFile._parent) {
    fileVersions = await File.find({ _parent: fileId });
  }

  if (fileVersions) {
    fileVersions.forEach(file => {
      if (fs.existsSync(process.env.FILE_UPLOAD_FOLDER + file.modified_name)) {
        // Delete the file version accordingly and handle request
        fs.unlink(process.env.FILE_UPLOAD_FOLDER + file.modified_name, (error) => {
          if (error) {
            return res.status(500).json({
              status: '500',
              message: 'Error deleting version of the file: ' + file.modified_name ,
              error: error
            });
          }
        });
      }
    });
  }

  // Pass the middleware// Pass the middleware
  next();

}

export { groupFileHandler, groupFileUploader, groupFileDelete, groupsFilesHandler }
