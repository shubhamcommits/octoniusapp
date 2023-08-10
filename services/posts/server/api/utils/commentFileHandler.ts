import { Response, Request, NextFunction } from "express";
import { minioClient } from "./minio-client";

const minio = require('minio');

/**
 * This function is the boiler plate for file handler mechanism for user comments attachements
 * @param req 
 * @param res 
 * @param next 
 */
const commentFileUploader = async (req: Request, res: Response, next: NextFunction) => {

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
    files.attachments.forEach(async (currentFile: any, index: Number) => {

      // Get the modified name from the comment files
      const indexFile = req.body.comment.files.findIndex(file => file.original_name === currentFile.name);
      const modified_name = req.body.comment.files[indexFile].modified_name;

      await minioClient.bucketExists((req.body.fileData._workspace).toLowerCase(), async (error, exists) => {
        if (error) {
          return res.status(500).json({
              status: '500',
              message: 'Error checking bucket exists.',
              error: error
          });
        }

        if (!exists) {
            // Make a bucket.
            await minioClient.makeBucket((req.body.fileData._workspace).toLowerCase(), async (error) => {
                if (error) {
                    return res.status(500).json({
                        status: '500',
                        message: 'Error creating bucket.',
                        error: error
                    });
                }

                const encryption = { algorithm: "AES256" };
                await minioClient.setBucketEncryption((req.body.fileData._workspace).toLowerCase(), encryption)
                .then(() => console.log("Encryption enabled"))
                .catch((error) => console.error(error));

                // Using fPutObject API upload your file to the bucket.
                minioClient.putObject((req.body.fileData._workspace).toLowerCase(), /*folder + */modified_name, currentFile.data, (error, objInfo) => {
                if (error) {
                    return res.status(500).json({
                    status: '500',
                    message: 'Error uploading file.',
                    error: error
                    });
                }
                });
            });
        } else {
            // Using fPutObject API upload your file to the bucket.
            minioClient.putObject((req.body.fileData._workspace).toLowerCase(), /*folder + */modified_name, currentFile.data, (error, objInfo) => {
                if (error) {
                    return res.status(500).json({
                        status: '500',
                        message: 'Error uploading file.',
                        error: error
                    });
                }
            });
        }
      });
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

    // Get the modified name from the comment files
    const index = comment['files'].findIndex(file => file.original_name === currentFile.name);
    const modified_name = comment['files'][index].modified_name;

    await minioClient.bucketExists((req.body.fileData._workspace).toLowerCase(), async (error, exists) => {
      if (error) {
        return res.status(500).json({
            status: '500',
            message: 'Error checking bucket exists.',
            error: error
        });
      }

      if (!exists) {
          // Make a bucket.
          await minioClient.makeBucket((req.body.fileData._workspace).toLowerCase(), async (error) => {
              if (error) {
                  return res.status(500).json({
                      status: '500',
                      message: 'Error creating bucket.',
                      error: error
                  });
              }

              const encryption = { algorithm: "AES256" };
              await minioClient.setBucketEncryption((req.body.fileData._workspace).toLowerCase(), encryption)
              .then(() => console.log("Encryption enabled"))
              .catch((error) => console.error(error));

              // Using fPutObject API upload your file to the bucket.
              minioClient.putObject((req.body.fileData._workspace).toLowerCase(), /*folder + */modified_name, currentFile.data, (error, objInfo) => {
              if (error) {
                  return res.status(500).json({
                  status: '500',
                  message: 'Error uploading file.',
                  error: error
                  });
              }

              // Convert the Object Back to string
              req.body.comment = JSON.stringify(req.body.comment)

              next();
              });
          });
      } else {
          // Using fPutObject API upload your file to the bucket.
          minioClient.putObject((req.body.fileData._workspace).toLowerCase(), /*folder + */modified_name, currentFile.data, (error, objInfo) => {
              if (error) {
                  return res.status(500).json({
                      status: '500',
                      message: 'Error uploading file.',
                      error: error
                  });
              }

              // Convert the Object Back to string
              req.body.comment = JSON.stringify(req.body.comment)

              next();
          });
      }
    });
  }
}

export { commentFileUploader }
