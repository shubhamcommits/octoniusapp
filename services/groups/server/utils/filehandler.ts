import { Response, Request, NextFunction } from "express";

const minio = require('minio');

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
        req.body.fileData = JSON.parse(req.body.fileData);

        // Get the file from the request
        const file: any = req['files'].groupAvatar;

        // Get the folder link from the environment
        let folder = process.env.FILE_UPLOAD_FOLDER;

        // Instantiate the fileName variable and add the date object in the name
        let fileName = '';
        if (req.body.fileData._workspace) {
            fileName += req.body.fileData._workspace +  '_';
      
            if (groupId) {
                fileName += groupId +  '_';
            }
        }
        fileName += Date.now().toString() + req['files'].groupAvatar['name'];

        // Modify the file accordingly and handle request
        // file.mv(folder + fileName, (error) => {
        //     if (error) {
        //         fileName = null;
        //         return res.status(500).json({
        //             status: '500',
        //             message: 'file upload error',
        //             error
        //         });
        //     }

        //     // Modify the current request to add 
        //     req['fileName'] = fileName;

        //     // Pass the middleware// Pass the middleware
        //     next();
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
                    minioClient.putObject(req.body.fileData._workspace, folder + fileName, file.data, (error, objInfo) => {
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
                minioClient.putObject(req.body.fileData._workspace, folder + fileName, file.data, (error, objInfo) => {
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
        req.body.fileData = JSON.parse(req.body.fileData);

        // Get the file from the request
        const file: any = req['files'].portfolioAvatar;

        // Get the folder link from the environment
        let folder = process.env.FILE_UPLOAD_FOLDER;

        // Instantiate the fileName variable and add the date object in the name
        let fileName = '';
        if (req.body.fileData._workspace) {
            fileName += req.body.fileData._workspace +  '_';
      
            if (portfolioId) {
                fileName += portfolioId +  '_';
            }
        }
        fileName += Date.now().toString() + req['files'].portfolioAvatar['name'];

        // Modify the file accordingly and handle request
        // file.mv(folder + fileName, (error) => {
        //     if (error) {
        //         fileName = null;
        //         return res.status(500).json({
        //             status: '500',
        //             message: 'file upload error',
        //             error
        //         });
        //     }

        //     // Modify the current request to add 
        //     req['fileName'] = fileName;

        //     // Pass the middleware// Pass the middleware
        //     next();
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
                    minioClient.putObject(req.body.fileData._workspace, folder + fileName, file.data, (error, objInfo) => {
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
                minioClient.putObject(req.body.fileData._workspace, folder + fileName, file.data, (error, objInfo) => {
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

export { groupUploadFileUpload, portfolioUploadFileUpload }
