import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils/senderror";
import { FilesService } from "../services";

// Create instance of files service
let filesService = new FilesService();

export class FilesControllers {

/**
 * This function is the boiler plate for file handler mechanism for group avatar
 * @param req 
 * @param res 
 * @param next 
 */
    async add(req: Request, res: Response, next: NextFunction){
        try {

            // Fetch the File Name From the request
            let { body: { file } } = req;

            // Create the file
            // file = await filesService.add(file);

            // Send Status 200 response
            return res.status(200).json({
                message: 'File has been uploaded!',
                file: file
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

}