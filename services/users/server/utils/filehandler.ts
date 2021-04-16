import { Response, Request, NextFunction } from "express";

/**
 * This function is the boiler plate for file handler mechanism for user profileImage
 * @param req 
 * @param res 
 * @param next 
 */
const userFileHandler = (req: Request, res: Response, next: NextFunction) => {

  // Get the file from the request
  const file: any = req['files'].profileImage;
  req.body.fileData = JSON.parse(req.body.fileData);

  // Get the folder link from the environment
  let folder = process.env.FILE_UPLOAD_FOLDER;

  // Instantiate the fileName variable and add the date object in the name
  let fileName = '';
  if (req.body.fileData._workspace) {
    fileName += req.body.fileData._workspace +  '_';

    if (req['userId']) {
      fileName += req['userId'] + '_';
    }
  }
  fileName += Date.now().toString() + '_' + req['files'].profileImage['name'];

  // Modify the file accordingly and handle request
  file.mv(folder + fileName, (error: Error) => {
    if (error) {
      fileName = null;
      return res.status(500).json({
        status: '500',
        message: 'file upload error',
        error: error
      });
    }

    // Modify the current request to add fileName
    req['fileName'] = fileName;

    // Pass the middleware
    next()
  });

}

export { userFileHandler }
