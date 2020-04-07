import { Response, Request, NextFunction } from "express";

/**
 * This function is the boiler plate for file handler mechanism for user post attachements
 * @param req 
 * @param res 
 * @param next 
 */
const postFileHandler = (req: Request, res: Response, next: NextFunction) => {

  // Initialize the req['files'] object
  let files: any = req['files']

  // Conver the String into the JSON Object
  req.body.post = JSON.parse(req.body.post)

  // Check the current request has files object underlying
  if (!files) {

    // Set the body.files object as null
    req.body.post.files = null;

    // Convert the Object Back to string
    req.body.post = JSON.stringify(req.body.post)

    // Pass the middleware
    next();

    // If multiple files are attached with post
  } else if (files.attachments.length > 1) {

    // Set the files property to an array
    req.body.post.files = [];

    // Fetch the files from the current request
    files.attachments.forEach((currentFile: any, index: Number) => {

      // Instantiate the fileName variable and add the date object in the name
      let fileName = Date.now().toString() + currentFile.name;

      // Get the folder link from the environment
      const folder = process.env.FILE_UPLOAD_FOLDER;

      // Modify the file accordingly and handle request
      currentFile.mv(folder + fileName, (error: Error) => {
        if (error) {
          fileName = null;
          return res.status(500).json({
            status: '500',
            message: 'file upload error',
            error: error
          });
        }
      });

      // Modify the file and serialise the object
      const file = {
        orignal_name: currentFile.name,
        modified_name: fileName
      };

      // Push the file object
      req.body.post.files.push(file);
    });

    // Convert the Object Back to string
    req.body.post = JSON.stringify(req.body.post)

    // Pass the middleware
    next();

    // If only single file is attached with post
  } else {

    // Set the files property to an array
    req.body.post.files = [];

    // Instantiate the fileName variable and add the date object in the name
    let fileName = Date.now().toString() + req['files'].attachments['name'];

    // Fetch the file from the current request
    const currentFile: any = req['files'].attachments;

    // Get the folder link from the environment
    const folder = process.env.FILE_UPLOAD_FOLDER;

    // Modify the file accordingly and handle request
    currentFile.mv(folder + fileName, (error: Error) => {
      if (error) {
        fileName = null;
        return res.status(500).json({
          status: '500',
          message: 'file upload error',
          error: error
        });
      }
    })

    // Modify the file and serialise the object
    const file = {
      orignal_name: req['files'].attachments['name'],
      modified_name: fileName
    };

    // Push the file object
    req.body.post.files.push(file);

    // Convert the Object Back to string
    req.body.post = JSON.stringify(req.body.post)

    // Pass the middleware
    next();
  }
}

export { postFileHandler }
