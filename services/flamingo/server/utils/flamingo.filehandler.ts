import { Response, Request, NextFunction } from "express";
import { sendError } from ".";
import { minioClient } from "./minio-client";

/**
 * This function is the boiler plate for file handler mechanism for user profileImage
 * @param req 
 * @param res 
 * @param next 
 */
const flamingoFileUploader = async (req: Request, res: Response, next: NextFunction) => {

  // Get the file from the request
  const file: any = req['files'].questionImage;
  req.body.fileData = JSON.parse(req.body.fileData);

  // Get the folder link from the environment
  // let folder = process.env.FILE_UPLOAD_FOLDER;

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

  await minioClient.bucketExists((req.body.fileData.workspaceId).toLowerCase(), async (error, exists) => {
    if (error) {
      fileName = null;
      return res.status(500).json({
        status: '500',
        message: 'Error checking bucket exists.',
        error: error
      });
    }
// minioClient.setBucketQuota((req.body.fileData.workspaceId), 100 * 1024 * 1024);
    if (!exists) {
      // Make a bucket.
      await minioClient.makeBucket((req.body.fileData.workspaceId).toLowerCase(), async (error) => {
        if (error) {
          fileName = null;
          return res.status(500).json({
            status: '500',
            message: 'Error creating bucket.',
            error: error
          });
        }

        const encryption = { algorithm: "AES256" };
        await minioClient.setBucketEncryption((req.body.fileData.workspaceId).toLowerCase(), encryption)
          .then(() => console.log("Encryption enabled"))
          .catch((error) => console.error(error));

        // Using fPutObject API upload your file to the bucket.
        minioClient.putObject((req.body.fileData.workspaceId).toLowerCase(), /*folder + */fileName, file.data, (error, objInfo) => {
          if (error) {
            fileName = null;
            return res.status(500).json({
              status: '500',
              message: 'Error uploading file.',
              error: error
            });
          }

          // Modify the current request to add 
          req['fileName'] = fileName;

          next();
        });
      });
    } else {
      // Using fPutObject API upload your file to the bucket.
      minioClient.putObject((req.body.fileData.workspaceId).toLowerCase(), /*folder + */fileName, file.data, (error, objInfo) => {
        if (error) {
          fileName = null;
          return res.status(500).json({
            status: '500',
            message: 'Error uploading file.',
            error: error
          });
        }

        // Modify the current request to add 
        req['fileName'] = fileName;

        next();
      });
    }
  });
}

/**
 * This function is the boiler plate for file handler mechanism for flamingo image
 * @param req 
 * @param res 
 * @param next 
 */
const flamingoFileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // Fetch the File Name From the request
    let { params: { workspaceId, file } } = req;

    await minioClient.getObject(workspaceId.toLowerCase(), file, async (error, data) => {
      if (error) {
        return res.status(500).json({
          message: 'Error getting file.',
          error: error
        });
      }

      data.pipe(res);
    });
  } catch (err) {
    return sendError(res, err, 'Internal Server Error!', 500);
  }
}

export { flamingoFileUploader, flamingoFileHandler }
