import { Response, Request, NextFunction } from "express";

/**
 * This function is the boiler plate for file handler mechanism for workspace avatar
 * @param req 
 * @param res 
 * @param next 
 */
const workspaceFileHandler = (req: Request, res: Response, next: NextFunction) => {

  // Check the current request has files object underlying
  if (!req['files']) {
    // Pass the middleware
    next();
  } else {

    const workspaceId = req.params.workspaceId;

    // Get the file from the request
    const file: any = req['files'].workspace_avatar;

    // Get the folder link from the environment
    let folder = process.env.FILE_UPLOAD_FOLDER;
    
    // Instantiate the fileName variable and add the date object in the name
    let fileName = '';
    if (workspaceId) {
      fileName += workspaceId +  '_';
    }
    fileName += Date.now().toString() + req['files'].workspace_avatar['name'];

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

      // Modify the current request to add 
      req.body.workspace_avatar = fileName;

      // Pass the middleware
      next();
    });
  }
}

/**
 * This function is the boiler plate for file handler mechanism for the lounges/stories
 * @param req 
 * @param res 
 * @param next 
 */
const loungeImageFileHandler = (req: Request, res: Response, next: NextFunction) => {

  // Check the current request has files object underlying
  if (!req['files']) {
    // Pass the middleware
    next();
  } else {
    const workspaceId = req.params.workspaceId;
    const elementId = req.params.elementId;

    // Get the file from the request
    const file: any = req['files'].image;
    const elementPropertyName = req.body.elementPropertyName.toString();

    // Get the folder link from the environment
    let folder = process.env.FILE_UPLOAD_FOLDER;
    
    // Instantiate the fileName variable and add the date object in the name
    let fileName = 'lounges_';
    if (workspaceId) {
      fileName += workspaceId +  '_';
    }
    fileName += elementId + '_' + Date.now().toString() + file.name;

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

      // Modify the current request to add 
      req.body[elementPropertyName] = fileName;

      // Pass the middleware
      next();
    });
  }
}

export { workspaceFileHandler, loungeImageFileHandler }
