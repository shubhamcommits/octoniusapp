import { Response, Request, NextFunction } from "express";
import { sendError } from ".";
import { Collection, Group, Portfolio } from "../api/models";
import { minioClient } from "./minio-client";

/**
 * This function is the boiler plate for file handler mechanism for user profileImage
 * @param req 
 * @param res 
 * @param next 
 */
const groupUploadFileUpload = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.files) {
        next();
    } else {
        const groupId = req.params.groupId;
        const workspaceId = req.params.workspaceId;
        req.body.fileData = JSON.parse(req.body.fileData);

        // Get the file from the request
        const file: any = req['files'].groupAvatar;

        // Instantiate the fileName variable and add the date object in the name
        let fileName = workspaceId + '_';
        if (groupId) {
            fileName += groupId +  '_';
        }

        fileName += Date.now().toString() + req['files'].groupAvatar['name'];

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
                const group = await Group.findById(groupId).select('group_avatar').lean();
                if (group && group?.group_avatar && !group?.group_avatar?.includes('assets/images/icon-new-group.svg')) {
                    await minioClient.removeObject(workspaceId.toLowerCase(), group?.group_avatar, (error) => {
                        if (error) {
                            return res.status(500).json({
                                status: '500',
                                message: 'Error removing previous group avatar.',
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
}

/**
 * This function is the boiler plate for file handler mechanism for user profileImage
 * @param req 
 * @param res 
 * @param next 
 */
const portfolioUploadFileUpload = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.files) {
        next();
    } else {
        const portfolioId = req.params.portfolioId;
        const workspaceId = req.params.workspaceId;
        req.body.fileData = JSON.parse(req.body.fileData);

        // Get the file from the request
        const file: any = req['files'].portfolioAvatar;

        // Instantiate the fileName variable and add the date object in the name
        let fileName = workspaceId +  '_';
    
        if (portfolioId) {
            fileName += portfolioId +  '_';
        }
        fileName += Date.now().toString() + req['files'].portfolioAvatar['name'];

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
                const portfolio = await Portfolio.findById(portfolioId).select('portfolio_avatar').lean();
                if (portfolio && portfolio?.portfolio_avatar && !portfolio?.portfolio_avatar?.includes('assets/images/icon-new-group.svg')) {
                    await minioClient.removeObject(workspaceId.toLowerCase(), portfolio?.portfolio_avatar, (error) => {
                        if (error) {
                            return res.status(500).json({
                                status: '500',
                                message: 'Error removing previous portfolio avatar.',
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

    await minioClient.getObject(workspaceId.toLowerCase(), file, async (error, data) => {
      if (error) {
        return res.status(500).json({
          message: 'Error getting file.',
          error: error
        });
      }

    //   const objectUrl = await minioClient.presignedUrl('GET', workspaceId, file);
    //   return res.status(301).redirect(objectUrl);
      data.pipe(res);
    });

  } catch (err) {
    return sendError(res, err, 'Internal Server Error!', 500);
  }
}

const collectionUploadFileUpload = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.files) {
        next();
    } else {
        const collectionId = req.params.collectionId;
        const workspaceId = req.params.workspaceId;

        // Get the file from the request
        const file: any = req['files'].image;

        // Instantiate the fileName variable and add the date object in the name
        let fileName = '';
        if (workspaceId) {
            fileName += workspaceId +  '_';
        }

        if (collectionId) {
            fileName += collectionId +  '_';
        }

        fileName += Date.now().toString() + file['name'];

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
                    await minioClient.setBucketEncryption(workspaceId, encryption)
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
                    req['fileName'] = /*folder + */fileName;

                    next();
                    });
                });
            } else {
                const collection = await Collection.findById(collectionId).select('collection_avatar').lean();
                if (collection && collection?.collection_avatar && !collection?.collection_avatar?.includes('assets/images/icon-new-group.svg')) {
                    await minioClient.removeObject(workspaceId.toLowerCase(), collection?.collection_avatar, (error) => {
                        if (error) {
                            return res.status(500).json({
                                status: '500',
                                message: 'Error removing previous collection avatar.',
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
                    req['fileName'] = /*folder + */fileName;

                    next();
                });
            }
        });
    }
}

const collectionFileUploader = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.files) {
        next();
    } else {
        const collectionId = req.params.collectionId;
        const workspaceId = req.params.workspaceId;

        req.body.fileData = JSON.parse(req.body.fileData);

        // Get the file from the request
        const file: any = req['files'].file;

        // Instantiate the fileName variable and add the date object in the name
        let fileName = '';
        if (workspaceId) {
            fileName += workspaceId +  '_';
        }

        if ( + req.body.fileData._group) {
            fileName +=  + req.body.fileData._group + '_';
        }

        if (collectionId) {
            fileName += collectionId +  '_';
        }

        fileName += Date.now().toString() + req.files.file['name'];
        
        req.body.fileData.original_name = req.files.file['name'];

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
                        req.body.fileData.modified_name = /*folder + */fileName;
                        req.body.fileData.minio_etag = objInfo.etag;
                        req.body.fileData.minio_versionId = objInfo.versionId;

                        next();
                    });
                });
            } else {
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
                    req.body.fileData.modified_name = /*folder + */fileName;
                    req.body.fileData.minio_etag = objInfo.etag;
                    req.body.fileData.minio_versionId = objInfo.versionId;

                    next();
                });
            }
        });
    }
}

const pageFileUploader = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.files) {
        next();
    } else {
        const collectionId = req.params.collectionId;
        const workspaceId = req.params.workspaceId;
        const pageId = req.params.pageId;

        req.body.fileData = JSON.parse(req.body.fileData);

        // Get the file from the request
        const file: any = req['files'].file;

        // Instantiate the fileName variable and add the date object in the name
        let fileName = '';
        if (workspaceId) {
            fileName += workspaceId +  '_';
        }

        if ( + req.body.fileData._group) {
            fileName +=  + req.body.fileData._group + '_';
        }

        if (collectionId) {
            fileName += collectionId +  '_';
        }

        if (pageId) {
            fileName += pageId +  '_';
        }

        fileName += Date.now().toString() + req.files.file['name'];
        
        req.body.fileData.original_name = req.files.file['name'];

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
                        req.body.fileData.modified_name = /*folder + */fileName;
                        req.body.fileData.minio_etag = objInfo.etag;
                        req.body.fileData.minio_versionId = objInfo.versionId;

                        next();
                    });
                });
            } else {
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
                    req.body.fileData.modified_name = /*folder + */fileName;
                    req.body.fileData.minio_etag = objInfo.etag;
                    req.body.fileData.minio_versionId = objInfo.versionId;

                    next();
                });
            }
        });
    }
}

export { groupUploadFileUpload, portfolioUploadFileUpload, fileHandler, collectionUploadFileUpload, collectionFileUploader, pageFileUploader }
