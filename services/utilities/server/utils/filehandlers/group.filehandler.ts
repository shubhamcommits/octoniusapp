import { Response, Request, NextFunction } from "express";
const multer = require("multer");

/**
 * This function is the boiler plate for file handler mechanism for group avatar
 * @param req 
 * @param res 
 * @param next 
 */
const groupFileHandler = (req: Request, res: Response, next: NextFunction) => {

  // Check the current request has files object underlying
  // if (!req['files']) {

  //   // Pass the middleware
  //   next();

  // } else {

  //   // Instantiate the fileName variable and add the date object in the name
  //   let fileName = Date.now().toString() + req['files'].group_avatar['name'];

  //   // Get the file from the request
  //   const file: any = req['files'].group_avatar;

  //   // Get the folder link from the environment
  //   const folder = process.env.FILE_UPLOAD_FOLDER;

  //   // Modify the file accordingly and handle request
  //   file.mv(folder + fileName, (error: Error) => {
  //     if (error) {
  //       fileName = null;
  //       return res.status(500).json({
  //         status: '500',
  //         message: 'file upload error',
  //         error: error
  //       });
  //     }

  //     // Modify the current request to add 
  //     req.body.group_avatar = fileName;

  //     // Pass the middleware
  //     next();
  //   });
  // }

  let files: any = req['files']['files'];
  console.log(files);
  // If no files present
  if (!files){
    return res.status(500).json({
      message: "0 Files selected"
    })
  }

  return res.status(200).json({
    message: `${files.length} files uploaded!`
  })
}

let folder = process.env.FILE_UPLOAD_FOLDER;
  console.log(folder);
  var Storage = multer.diskStorage({
    destination: folder,
    filename: function(req, file, callback) {
      callback(null, file.fieldname + "_" + Date.now() + '_' + file.file.originalname);
    }
  });


  // req['files'] = files;


  var upload = multer({
    storage: Storage
  });

export { groupFileHandler, upload }
