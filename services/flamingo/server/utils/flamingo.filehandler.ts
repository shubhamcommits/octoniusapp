import { Response, Request, NextFunction } from "express";

/**
 * This function is the boiler plate for file handler mechanism for user profileImage
 * @param req 
 * @param res 
 * @param next 
 */
const flamingoFileHandler = (req: Request, res: Response, next: NextFunction) => {

  // Get the file from the request
  const file: any = req['files'].questionImage;
  req.body.fileData = JSON.parse(req.body.fileData);

  // Get the folder link from the environment
  let folder = process.env.FILE_UPLOAD_FOLDER;

  // Instantiate the fileName variable and add the date object in the name
  let fileName = '';
  if (req.body.fileData.workspaceId) {
    fileName += req.body.fileData.workspaceId +  '_';
  }
  if (req.body.fileData._groupId) {
    fileName += req.body.fileData._groupId +  '_';
  }
  if(req.body.fileData.flamingoId){
    fileName += req.body.fileData.flamingoId +  '_';
  } 
  if(req.body.fileData.questionId){
    fileName += req.body.fileData.questionId +  '_';
  }
  
  fileName += Date.now().toString() + '_' + req['files'].questionImage['name'].replace(/\s/g, "");

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

export { flamingoFileHandler }
