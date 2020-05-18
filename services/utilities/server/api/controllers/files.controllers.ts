import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils/senderror";
import { FilesService } from "../services";

// Create instance of files service
let filesService = new FilesService();

export class FilesControllers {

    /**
     * This function is used to fetch list of the files
     * @param req 
     * @param res 
     * @param next 
     */
    async get(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the File Name From the request
            let { query: { groupId, lastFileId } } = req;

            // Files List
            let files: any = []

            // Get files list
            if (lastFileId == undefined || lastFileId == 'undefined')
                files = await filesService.get(groupId.toString());

            else
                files = await filesService.get(groupId.toString(), lastFileId.toString());

            // Send Status 200 response
            return res.status(200).json({
                message: 'Files list fetched!',
                files: files
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is the boiler plate for adding files to the group
     * @param req 
     * @param res 
     * @param next 
     */
    async add(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the File Name From the request
            let { body: { fileData } } = req;

            // Create the file
            fileData = await filesService.add(fileData);

            // Send Status 200 response
            return res.status(200).json({
                message: 'File has been uploaded!',
                file: fileData
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is used to search list of the files
     * @param req 
     * @param res 
     * @param next 
     */
    async search(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the File Name From the request
            let { query: { groupId, query } } = req;

            // Files List
            let files: any = []

            // Get files list
            files = await filesService.searchFiles(groupId.toString(), query);

            // Send Status 200 response
            return res.status(200).json({
                message: 'Files list fetched!',
                files: files
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

}