import { Response, Request, NextFunction } from "express";
import { sendError } from "../senderror";
import { minioClient } from "../minio-client";

/**
 * This function is the boiler plate for file handler mechanism for workspace avatar
 * @param req 
 * @param res 
 * @param next 
 */
const workspaceFileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // Fetch the File Name From the request
    let { params: { workspaceId, file } } = req;

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

export { workspaceFileHandler }
