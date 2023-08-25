import { Response, Request, NextFunction } from "express";
import { sendError } from "../senderror";
import { File, Flamingo } from '../../api/models';
import { Readable } from 'stream';
import moment from 'moment';

const minio = require('minio');

/**
 * This function is the boiler plate for file handler mechanism for group avatar
 * @param req 
 * @param res 
 * @param next 
 */
 const groupFileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // Fetch the File Name From the request
    let { params: { workspaceId, file } } = req;

    var minioClient = new minio.Client({
      endPoint: process.env.MINIO_DOMAIN,
      port: +(process.env.MINIO_API_PORT),
      useSSL: process.env.MINIO_PROTOCOL == 'https',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });

    await minioClient.getObject(workspaceId, /*process.env.FILE_UPLOAD_FOLDER + */file, async (error, data) => {
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

/**
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const groupsFilesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Fetch the File Name From the request
    let { params: { workspaceId, fileId } } = req;

    var minioClient = new minio.Client({
      endPoint: process.env.MINIO_DOMAIN,
      port: +(process.env.MINIO_API_PORT),
      useSSL: process.env.MINIO_PROTOCOL == 'https',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });

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

        await minioClient.getObject(workspaceId, /*process.env.FILE_UPLOAD_FOLDER + */fileVersions[0].modified_name, async (error, data) => {
          if (error) {
            return res.status(500).json({
              message: 'Error getting file.',
              error: error
            });
          }

          const objectUrl = await minioClient.presignedUrl('GET', workspaceId, /*process.env.FILE_UPLOAD_FOLDER + */fileVersions[0].modified_name);
          return res.status(301).redirect(objectUrl);
        });
      }
    } else {
      // Redirect the Response to the Groups Microservice
      await minioClient.getObject(workspaceId, /*process.env.FILE_UPLOAD_FOLDER + */file.modified_name, async (error, data) => {
        if (error) {
          return res.status(500).json({
            message: 'Error getting file.',
            error: error
          });
        }

        // const objectUrl = await minioClient.presignedGetObject(req.query.workspaceId, req.query.modified_name);
        const objectUrl = await minioClient.presignedUrl('GET', workspaceId, /*process.env.FILE_UPLOAD_FOLDER + */file.modified_name);
        return res.status(301).redirect(objectUrl);
      });
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
  let { params: { workspaceId, groupId, folderId } } = req;

  req.body.fileData = JSON.parse(req.body.fileData);

  if (!req.files) {
    next();
  } else {

    /// Instantiate the fileName variable and add the date object in the name
    let fileName: any = Date.now().toString() + "_" + req['files'].file['name'];

    // Get the file from the request
    const file: any = req['files'].file;

    // Get the folder link from the environment
    let folder = '';//process.env.FILE_UPLOAD_FOLDER;
    if (workspaceId) {
      folder += workspaceId +  '/';

      if (groupId) {
        folder += groupId +  '/';

        if (folderId) {
          folder += folderId + '/';
        }
      }
    }

    // Instantiate the minio client with the endpoint
    // and access keys as shown below.
    var minioClient = new minio.Client({
        endPoint: process.env.MINIO_DOMAIN,
        port: +(process.env.MINIO_API_PORT),
        useSSL: process.env.MINIO_PROTOCOL == 'https',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY
    });

    await minioClient.bucketExists((workspaceId).toLowerCase(), async (error, exists) => {
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
        await minioClient.makeBucket((workspaceId).toLowerCase(), async (error) => {
          if (error) {
            fileName = null;
            return res.status(500).json({
              status: '500',
              message: 'Error creating bucket.',
              error: error
            });
          }

          const encryption = { algorithm: "AES256" };
          await minioClient.setBucketEncryption((workspaceId).toLowerCase(), encryption)
            .then(() => console.log("Encryption enabled"))
            .catch((error) => console.error(error));

          // Using fPutObject API upload your file to the bucket.
          minioClient.putObject(workspaceId, folder + fileName, file.data, (error, objInfo) => {
            if (error) {
              fileName = null;
              return res.status(500).json({
                status: '500',
                message: 'Error uploading file.',
                error: error
              });
            }

            // Modify the current request to add 
            req.body.fileData.original_name = req['files'].file['name'];
            req.body.fileData.modified_name = folder + fileName;
            req.body.fileData.minio_etag = objInfo.etag;
            req.body.fileData.minio_versionId = objInfo.versionId;

            next();
          });
        });
      } else {
        // Using fPutObject API upload your file to the bucket.
        minioClient.putObject((workspaceId).toLowerCase(), folder + fileName, file.data, (error, objInfo) => {
          if (error) {
            fileName = null;
            return res.status(500).json({
              status: '500',
              message: 'Error uploading file.',
              error: error
            });
          }

          // Modify the current request to add
          req.body.fileData.original_name = req['files'].file['name'];
          req.body.fileData.modified_name = folder + fileName;
          req.body.fileData.minio_etag = objInfo.etag;
          req.body.fileData.minio_versionId = objInfo.versionId;

          next();
        });
      }
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

  var minioClient = new minio.Client({
      endPoint: process.env.MINIO_DOMAIN,
      port: +(process.env.MINIO_API_PORT),
      useSSL: process.env.MINIO_PROTOCOL == 'https',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
  });
  
  if (req.body.fileName && req.body.fileName != '' && deletedFile && (deletedFile.type == 'file' || deletedFile.type == 'campaign')) {
    await minioClient.removeObject((req.body.workspaceId).toLowerCase(), /*process.env.FILE_UPLOAD_FOLDER + */req.body.fileName, (error) => {
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

  // Delete the imgs from the questions of flamingos
  if (req.body.flamingoType) {
    let flamingo = await Flamingo.findOne({_file:fileId});
    flamingo = await Flamingo.populate(flamingo, [
      { path: '_questions' }
    ]);

    if (flamingo) {
      flamingo._questions.forEach(async question => {
        if (question.image_url && question.image_url != '') {
          await minioClient.removeObject((req.body.workspaceId).toLowerCase(), /*process.env.FILE_UPLOAD_FOLDER + */question.image_url, (error) => {
            if (error) {
              return res.status(500).json({
                status: '500',
                message: 'Error deleting image of flamingo: ' + question.image_url,
                error: error
              });
            }
          });
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
    for (let i = 0; i < fileVersions.length; i++) {
      let file = fileVersions[i];
      await minioClient.removeObject((req.body.workspaceId).toLowerCase(), /*process.env.FILE_UPLOAD_FOLDER + */file.modified_name, (error) => {
        if (error) {
          return res.status(500).json({
            status: '500',
            message: 'Error deleting version of the file: ' + file.modified_name ,
            error: error
          });
        }
      });
    // });
    }
  }

  // Pass the middleware// Pass the middleware
  next();
}

/**
 * This function is the boiler plate to delete the file for files
 * @param req 
 * @param res 
 * @param next 
 */
const folioFileDelete = async (req: Request, res: Response, next: NextFunction) => {

  const { folderId } = req.params;

  var minioClient = new minio.Client({
      endPoint: process.env.MINIO_DOMAIN,
      port: +(process.env.MINIO_API_PORT),
      useSSL: process.env.MINIO_PROTOCOL == 'https',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
  });

  let filesStream = Readable.from(await File.find({ _folder: folderId }).select('_id'));

  // Delete all the folders present in a folder
  filesStream.on('data', async (fileToDelete) => {
      if (fileToDelete.type == 'file' || fileToDelete.type == 'campaign') {
        await minioClient.removeObject((req.body.workspaceId).toLowerCase(), fileToDelete.modified_name, (error) => {
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

      // Delete the imgs from the questions of flamingos
      if (req.body.flamingoType) {
        let flamingo = await Flamingo.findOne({ _file:fileToDelete._id });
        flamingo = await Flamingo.populate(flamingo, [
          { path: '_questions' }
        ]);

        if (flamingo) {
          flamingo._questions.forEach(async question => {
            if (question.image_url && question.image_url != '') {
              await minioClient.removeObject((req.body.workspaceId).toLowerCase(), question.image_url, (error) => {
                if (error) {
                  return res.status(500).json({
                    status: '500',
                    message: 'Error deleting image of flamingo: ' + question.image_url,
                    error: error
                  });
                }
              });
            }
          });
        }
      }

      let fileVersions;
      let countVersions;
      if (fileToDelete._parent) {
        countVersions = await File.find({ _parent: fileToDelete._parent }).countDocuments();
      }
      
      if ((countVersions && countVersions <= 1) || !fileToDelete._parent) {
        fileVersions = await File.find({ _parent: fileToDelete._id });
      }

      if (fileVersions) {
        for (let i = 0; i < fileVersions.length; i++) {
          let file = fileVersions[i];
          await minioClient.removeObject((req.body.workspaceId).toLowerCase(), file.modified_name, (error) => {
            if (error) {
              return res.status(500).json({
                status: '500',
                message: 'Error deleting version of the file: ' + file.modified_name ,
                error: error
              });
            }
          });
        }
      }
  });

  // Pass the middleware// Pass the middleware
  next();
}

/**
 * This function is the boiler plate for file handler mechanism for group avatar
 * @param req 
 * @param res 
 * @param next 
 */
 const minioFileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    var minioClient = new minio.Client({
      endPoint: process.env.MINIO_DOMAIN,
      port: +(process.env.MINIO_API_PORT),
      useSSL: process.env.MINIO_PROTOCOL == 'https',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });

    let workspaceId = (req.query.workspaceId + '').toLowerCase();

    await minioClient.getObject(workspaceId, /*process.env.FILE_UPLOAD_FOLDER + */req.query.modified_name, async (error, data) => {
      if (error) {
        return res.status(500).json({
          message: 'Error getting file.',
          error: error
        });
      }

      const objectUrl = await minioClient.presignedUrl('GET', workspaceId, req.query.modified_name);
      return res.status(200).json({
        url: objectUrl,
        message: 'File succesfully obtained.'
      });
    });
  } catch (err) {
    return sendError(res, err, 'Internal Server Error!', 500);
  }
}

export { groupFileHandler, groupFileUploader, groupFileDelete, groupsFilesHandler, folioFileDelete, minioFileHandler }
