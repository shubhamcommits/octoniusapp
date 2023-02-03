import { Response, Request, NextFunction } from "express";
import { sendError } from ".";
import { Workspace } from "../api/models";

const minio = require('minio');

/**
 * This function is the boiler plate for file handler mechanism for workspace avatar
 * @param req 
 * @param res 
 * @param next 
 */
const workspaceFileUploader = async (req: Request, res: Response, next: NextFunction) => {

  // Check the current request has files object underlying
  if (!req['files']) {
    // Pass the middleware
    next();
  } else {

    const workspaceId = req.params.workspaceId;

    // Get the file from the request
    const file: any = req['files'].workspace_avatar;

    // Get the folder link from the environment
    // let folder = process.env.FILE_UPLOAD_FOLDER;
    
    // Instantiate the fileName variable and add the date object in the name
    let fileName = '';
    if (workspaceId) {
      fileName += workspaceId +  '_';
    }
    fileName += Date.now().toString() + req['files'].workspace_avatar['name'];

    // Modify the file accordingly and handle request
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
    //     req.body.workspace_avatar = fileName;

    //     // Pass the middleware
    //     next();
    //   });
    var minioClient = new minio.Client({
          endPoint: process.env.MINIO_DOMAIN,
          port: +(process.env.MINIO_API_PORT),
          useSSL: process.env.MINIO_PROTOCOL == 'https',
          accessKey: process.env.MINIO_ACCESS_KEY,
          secretKey: process.env.MINIO_SECRET_KEY
      });

      await minioClient.bucketExists(req.body.fileData._workspace, async (error, exists) => {
        if (error) {
          fileName = null;
          return res.status(500).json({
            status: '500',
            message: 'Error checking bucket exists.',
            error: error
          });
        }

        if (!exists) {
          // Make a bucket.
          await minioClient.makeBucket(req.body.fileData._workspace, async (error) => {
            if (error) {
              fileName = null;
              return res.status(500).json({
                status: '500',
                message: 'Error creating bucket.',
                error: error
              });
            }

            const encryption = { algorithm: "AES256" };
            await minioClient.setBucketEncryption(req.body.fileData._workspace, encryption)
              .then(() => console.log("Encryption enabled"))
              .catch((error) => console.error(error));

            // Using fPutObject API upload your file to the bucket.
            minioClient.putObject(req.body.fileData._workspace, /*folder + */fileName, file.data, (error, objInfo) => {
              if (error) {
                fileName = null;
                return res.status(500).json({
                  status: '500',
                  message: 'Error uploading file.',
                  error: error
                });
              }

              // Modify the current request to add 
              req.body.workspace_avatar = fileName;

              next();
            });
          });
        } else {
          const workspace = await Workspace.findById(workspaceId).select('workspace_avatar').lean();
          if (workspace && workspace?.workspace_avatar && !workspace?.workspace_avatar?.includes('assets/images/organization.png')) {
              await minioClient.removeObject(workspaceId, workspace?.workspace_avatar, (error) => {
                  if (error) {
                      return res.status(500).json({
                          status: '500',
                          message: 'Error removing previous workspace avatar.',
                          error: error
                      });
                  }
              });
          }

          // Using fPutObject API upload your file to the bucket.
          minioClient.putObject(req.body.fileData._workspace, /*folder + */fileName, file.data, (error, objInfo) => {
            if (error) {
              fileName = null;
              return res.status(500).json({
                status: '500',
                message: 'Error uploading file.',
                error: error
              });
            }

            // Modify the current request to add 
            req.body.workspace_avatar = fileName;

            next();
          });
        }
      });
    }
}

/**
 * This function is the boiler plate for file handler mechanism for the lounges/stories
 * @param req 
 * @param res 
 * @param next 
 */
const loungeImageFileUploader = async (req: Request, res: Response, next: NextFunction) => {

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
    // let folder = process.env.FILE_UPLOAD_FOLDER;
    
    // Instantiate the fileName variable and add the date object in the name
    let fileName = 'lounges_';
    if (workspaceId) {
      fileName += workspaceId +  '_';
    }
    fileName += elementId + '_' + Date.now().toString() + file.name;

    // Modify the file accordingly and handle request
    // file.mv(folder + fileName, (error: Error) => {
    //   if (error) {
    //     fileName = null;
    //     return res.status(500).json({
    //       status: '500',
    //       message: 'file upload error',
    //       error: error
    //     });
    //   }

    //   // Modify the current request to add 
    //   req.body[elementPropertyName] = fileName;

    //   // Pass the middleware
    //   next();
    // });

    var minioClient = new minio.Client({
        endPoint: process.env.MINIO_DOMAIN,
        port: +(process.env.MINIO_API_PORT),
        useSSL: process.env.MINIO_PROTOCOL == 'https',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY
    });

    await minioClient.bucketExists(req.body.fileData._workspace, async (error, exists) => {
      if (error) {
        fileName = null;
        return res.status(500).json({
          status: '500',
          message: 'Error checking bucket exists.',
          error: error
        });
      }

      if (!exists) {
        // Make a bucket.
        await minioClient.makeBucket(req.body.fileData._workspace, async (error) => {
          if (error) {
            fileName = null;
            return res.status(500).json({
              status: '500',
              message: 'Error creating bucket.',
              error: error
            });
          }

          const encryption = { algorithm: "AES256" };
          await minioClient.setBucketEncryption(req.body.fileData._workspace, encryption)
            .then(() => console.log("Encryption enabled"))
            .catch((error) => console.error(error));

          // Using fPutObject API upload your file to the bucket.
          minioClient.putObject(req.body.fileData._workspace, /*folder + */fileName, file.data, (error, objInfo) => {
            if (error) {
              fileName = null;
              return res.status(500).json({
                status: '500',
                message: 'Error uploading file.',
                error: error
              });
            }

            // Modify the current request to add 
            req.body[elementPropertyName] = fileName;

            next();
          });
        });
      } else {
        // Using fPutObject API upload your file to the bucket.
        minioClient.putObject(req.body.fileData._workspace, /*folder + */fileName, file.data, (error, objInfo) => {
          if (error) {
            fileName = null;
            return res.status(500).json({
              status: '500',
              message: 'Error uploading file.',
              error: error
            });
          }

          // Modify the current request to add 
          req.body[elementPropertyName] = fileName;

          next();
        });
      }
    });
  }
}

/**
 * This function is the boiler plate for file handler
 * @param req 
 * @param res 
 * @param next 
 */
const fileHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {

    // Fetch the File Name From the request
    let { params: { workspaceId, file } } = req;

    // Redirect the Response to the Groups Microservice
    // return res.status(301).redirect(`${process.env.GROUPS_SERVER}/uploads/${file}`)
    var minioClient = new minio.Client({
      endPoint: process.env.MINIO_DOMAIN,
      port: +(process.env.MINIO_API_PORT),
      useSSL: process.env.MINIO_PROTOCOL == 'https',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });

    await minioClient.getObject(workspaceId, file, async (error, data) => {
      if (error) {
        return res.status(500).json({
          message: 'Error getting file.',
          error: error
        });
      }

      // const objectUrl = await minioClient.presignedUrl('GET', workspaceId, file);
      // return res.status(301).redirect(objectUrl);
      data.pipe(res);
    });

  } catch (err) {
    return sendError(res, err, 'Internal Server Error!', 500);
  }
}

export { workspaceFileUploader, loungeImageFileUploader, fileHandler }
