import { Response, Request, NextFunction } from "express";
import { sendError } from "../senderror";

const minio = require('minio');

/**
 * This function is the boiler plate for file handler mechanism for user profileImage
 * @param req 
 * @param res 
 * @param next 
 */
const userFileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // Fetch the File Name From the request
    let { params: { workspaceId, file } } = req;

    // Redirect the Response to the Users Microservice
    // return res.status(301).redirect(`${process.env.USERS_SERVER}/uploads/${file}`)
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

      // const objectUrl = await minioClient.presignedGetObject(req.query.workspaceId, req.query.modified_name);
      const objectUrl = await minioClient.presignedUrl('GET', workspaceId, file);
      return res.status(301).redirect(objectUrl);
    });

  } catch (err) {
    return sendError(res, err, 'Internal Server Error!', 500);
  }

}

export { userFileHandler }
