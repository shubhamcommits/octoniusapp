import { Response, Request, NextFunction } from "express";
import { sendError } from ".";
import { Group, Post } from '../models';

const minio = require('minio');

/**
 * This function is the boiler plate for file handler mechanism for user post attachements
 * @param req 
 * @param res 
 * @param next 
 */
const postFileUploader = async (req: Request, res: Response, next: NextFunction) => {

  // Initialize the req['files'] object
  let files: any = req['files']

  // Conver the String into the JSON Object
  req.body.post = JSON.parse(req.body.post)
  const postId = req.params.postId;

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

    let post = req.body.post;

    let groupId;
    if (post._group) {
      groupId = post._group._id || post._group;
    } else if (postId) {
      const postDB = await Post.findById({_id: postId}).select('_group').lean();
      groupId = postDB._group._id || postDB._group;
    }

    const group = await Group.findById({_id: groupId}).select('_workspace').lean();

    // Fetch the files from the current request
    files.attachments.forEach(async (currentFile: any, index: Number) => {

      // Get the folder link from the environment
      // const folder = process.env.FILE_UPLOAD_FOLDER;

      // Instantiate the fileName variable and add the date object in the name
      let fileName = '';
      if (group && (group._workspace._id || group._workspace)) {
        fileName += (group._workspace._id || group._workspace) +  '_';
  
        if (groupId) {
          fileName += groupId +  '_';
  
          if (postId) {
            fileName += postId + '_';
          }
        }
      }
      fileName += Date.now().toString() + currentFile.name;

      // Modify the file accordingly and handle request
      // currentFile.mv(folder + fileName, (error: Error) => {
      //   if (error) {
      //     fileName = null;
      //     return res.status(500).json({
      //       status: '500',
      //       message: 'file upload error',
      //       error: error
      //     });
      //   }
      // });

      // // Modify the file and serialise the object
      // const file = {
      //   original_name: currentFile.name,
      //   modified_name: fileName
      // };

      // // Push the file object
      // req.body.post.files.push(file);

        var minioClient = new minio.Client({
            endPoint: process.env.MINIO_DOMAIN,
            port: +(process.env.MINIO_API_PORT),
            useSSL: process.env.MINIO_PROTOCOL == 'https',
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY
        });

        await minioClient.bucketExists((group._workspace._id || group._workspace), async (error, exists) => {
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
              await minioClient.makeBucket((group._workspace._id || group._workspace), async (error) => {
                  if (error) {
                    fileName = null;
                    return res.status(500).json({
                        status: '500',
                        message: 'Error creating bucket.',
                        error: error
                    });
                  }

                  const encryption = { algorithm: "AES256" };
                  await minioClient.setBucketEncryption((group._workspace._id || group._workspace), encryption)
                    .then(() => console.log("Encryption enabled"))
                    .catch((error) => console.error(error));

                    // Using fPutObject API upload your file to the bucket.
                    minioClient.putObject((group._workspace._id || group._workspace), /*folder + */fileName, currentFile.data, (error, objInfo) => {
                    if (error) {
                        fileName = null;
                        return res.status(500).json({
                        status: '500',
                        message: 'Error uploading file.',
                        error: error
                        });
                    }

                    // Modify the file and serialise the object
                    const file = {
                      original_name: currentFile.name,
                      modified_name: fileName
                    };

                    // Push the file object
                    req.body.post.files.push(file);

                    next();
                  });
              });
            } else {
              // Using fPutObject API upload your file to the bucket.
              minioClient.putObject((group._workspace._id || group._workspace), /*folder + */fileName, currentFile.data, (error, objInfo) => {
                  if (error) {
                  fileName = null;
                  return res.status(500).json({
                      status: '500',
                      message: 'Error uploading file.',
                      error: error
                  });
                  }

                  // Modify the file and serialise the object
                  const file = {
                    original_name: currentFile.name,
                    modified_name: fileName
                  };

                  // Push the file object
                  req.body.post.files.push(file);

                  next();
              });
            }
        });
    });

    // Convert the Object Back to string
    req.body.post = JSON.stringify(req.body.post)

    // Pass the middleware
    next();

    // If only single file is attached with post
  } else {

    let post = req.body.post;

    let groupId;
    if (post._group) {
      groupId = post._group._id || post._group;
    } else if (postId) {
      const postDB = await Post.findById({_id: postId}).select('_group').lean();
      groupId = postDB._group._id || postDB._group;
    }

    let group;
    if (groupId) {
      group = await Group.findById({_id: groupId}).select('_workspace').lean();
    }

    // Set the files property to an array
    req.body.post.files = [];

    // Fetch the file from the current request
    const currentFile: any = req['files'].attachments;

    // Get the folder link from the environment
    // let folder = process.env.FILE_UPLOAD_FOLDER;

    // Instantiate the fileName variable and add the date object in the name
    let fileName = '';
    if (group && (group._workspace._id || group._workspace)) {
      fileName += (group._workspace._id || group._workspace) +  '_';

      if (groupId) {
        fileName += groupId +  '_';

        if (postId) {
          fileName += postId + '_';
        }
      }
    }
    fileName += Date.now().toString() + req['files'].attachments['name'];

    // Modify the file accordingly and handle request
    // currentFile.mv(folder + fileName, (error: Error) => {
    //   if (error) {
    //     fileName = null;
    //     return res.status(500).json({
    //       status: '500',
    //       message: 'file upload error',
    //       error: error
    //     });
    //   }
    // })

    // // Modify the file and serialise the object
    // const file = {
    //   original_name: req['files'].attachments['name'],
    //   modified_name: fileName
    // };

    // // Push the file object
    // req.body.post.files.push(file);

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
                minioClient.putObject(req.body.fileData._workspace, /*folder + */fileName, currentFile.data, (error, objInfo) => {
                if (error) {
                    fileName = null;
                    return res.status(500).json({
                    status: '500',
                    message: 'Error uploading file.',
                    error: error
                    });
                }

                // Modify the file and serialise the object
                const file = {
                  original_name: currentFile.name,
                  modified_name: fileName
                };

                // Push the file object
                req.body.post.files.push(file);

                next();
              });
          });
        } else {
          // Using fPutObject API upload your file to the bucket.
          minioClient.putObject(req.body.fileData._workspace, /*folder + */fileName, currentFile.data, (error, objInfo) => {
              if (error) {
              fileName = null;
              return res.status(500).json({
                  status: '500',
                  message: 'Error uploading file.',
                  error: error
              });
              }

              // Modify the file and serialise the object
              const file = {
                original_name: currentFile.name,
                modified_name: fileName
              };

              // Push the file object
              req.body.post.files.push(file);

              next();
          });
        }
    });

    // Convert the Object Back to string
    req.body.post = JSON.stringify(req.body.post)

    // Pass the middleware
    next();
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

export { postFileUploader, fileHandler }
