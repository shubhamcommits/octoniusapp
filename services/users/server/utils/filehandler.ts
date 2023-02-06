import { Response, Request, NextFunction } from "express";
import { sendError } from ".";
import { User } from "../api/models";

const minio = require('minio');

/**
 * This function is the boiler plate for file handler mechanism for user profileImage
 * @param req 
 * @param res 
 * @param next 
 */
const userFileUploader = async (req: Request, res: Response, next: NextFunction) => {

  const workspaceId = req.params.workspaceId;
  // Get the file from the request
  const file: any = req['files'].profileImage;
  req.body.fileData = JSON.parse(req.body.fileData);

  // Get the folder link from the environment
  // let folder = process.env.FILE_UPLOAD_FOLDER;
  
  // Instantiate the fileName variable and add the date object in the name
  let fileName = workspaceId + '_' + req['userId'] + '_' + Date.now().toString() + '_' + req['files'].profileImage['name'];

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

  //   // Modify the current request to add fileName
  //   req['fileName'] = fileName;

  //   // Pass the middleware
  //   next()
  // });

  var minioClient = new minio.Client({
      endPoint: process.env.MINIO_DOMAIN,
      port: +(process.env.MINIO_API_PORT),
      useSSL: process.env.MINIO_PROTOCOL == 'https',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
  });

  await minioClient.bucketExists(workspaceId.toLowerCase(), async (error, exists) => {
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
      await minioClient.makeBucket(workspaceId.toLowerCase(), async (error) => {
        if (error) {
          fileName = null;
          return res.status(500).json({
            status: '500',
            message: 'Error creating bucket.',
            error: error
          });
        }

        const encryption = { algorithm: "AES256" };
        await minioClient.setBucketEncryption(workspaceId.toLowerCase(), encryption)
          .then(() => console.log("Encryption enabled"))
          .catch((error) => console.error(error));

        // Using fPutObject API upload your file to the bucket.
        minioClient.putObject(workspaceId.toLowerCase(), /*folder + */fileName, file.data, (error, objInfo) => {
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
      const user = await User.findById(req['userId']).select('profile_pic').lean();
      if (user && user?.profile_pic && !user?.profile_pic?.includes('assets/images/user.png')) {
          await minioClient.removeObject(workspaceId.toLowerCase(), user?.profile_pic, (error) => {
              if (error) {
                  return res.status(500).json({
                      status: '500',
                      message: 'Error removing previous user avatar.',
                      error: error
                  });
              }
          });
      }
    
      // Using fPutObject API upload your file to the bucket.
      minioClient.putObject(workspaceId.toLowerCase(), /*folder + */fileName, file.data, (error, objInfo) => {
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

    await minioClient.getObject(workspaceId.toLowerCase(), file, async (error, data) => {
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

export { userFileUploader, fileHandler }
