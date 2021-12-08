import { Response, Request, NextFunction } from "express";

/**
 * This function is the boiler plate for file handler mechanism for user comments attachements
 * @param req 
 * @param res 
 * @param next 
 */
const commentFileHandler = async (req: Request, res: Response, next: NextFunction) => {

  // Initialize the req['files'] object
  let files: any = req['files']

  // Conver the String into the JSON Object
  req.body.comment = JSON.parse(req.body.comment)

  // Check the current request has files object underlying
  if (!files) {
    // Set the body.files object as null
    req.body.comment.files = null;

    // Convert the Object Back to string
    req.body.comment = JSON.stringify(req.body.comment);

    // Pass the middleware
    next();

    // If multiple files are attached with comment
  } else if (files.attachments.length > 1) {

    // Fetch the files from the current request
    files.attachments.forEach((currentFile: any, index: Number) => {

      // Get the folder link from the environment
      const folder = process.env.FILE_UPLOAD_FOLDER;

      // Get the modified name from the comment files
      const indexFile = req.body.comment.files.findIndex(file => file.original_name === currentFile.name);
      const modified_name = req.body.comment.files[indexFile].modified_name;

      // Modify the file accordingly and handle request
      currentFile.mv(folder + modified_name, (error: Error) => {
        if (error) {
          // fileName = null;
          return res.status(500).json({
            status: '500',
            message: 'file upload error',
            error: error
          });
        }
      });

      // Modify the file and serialise the object
      // const file = {
      //   original_name: req['files'].attachments['name'],
      //   modified_name: modified_name
      // };

      // Push the file object
      // req.body.comment.files.push(file);
    });

    // Convert the Object Back to string
    req.body.comment = JSON.stringify(req.body.comment)

    // Pass the middleware
    next();

    // If only single file is attached with comment
  } else {
    const comment = req.body.comment;

    // Fetch the file from the current request
    const currentFile: any = req['files'].attachments;

    // Get the folder link from the environment
    const folder = process.env.FILE_UPLOAD_FOLDER;

    // Get the modified name from the comment files
    const index = comment['files'].findIndex(file => file.original_name === currentFile.name);
    const modified_name = comment['files'][index].modified_name;

    // Modify the file accordingly and handle request
    currentFile.mv(folder + modified_name, (error: Error) => {
      if (error) {
        //fileName = null;
        return res.status(500).json({
          status: '500',
          message: 'file upload error',
          error: error
        });
      }
    })

    // Modify the file and serialise the object
    // const file = {
    //   original_name: req['files'].attachments['name'],
    //   modified_name: modified_name
    // };

    // Push the file object
    // req.body.comment.files.push(file);

    // Convert the Object Back to string
    req.body.comment = JSON.stringify(req.body.comment)

    // Pass the middleware
    next();
  }
}

export { commentFileHandler }
