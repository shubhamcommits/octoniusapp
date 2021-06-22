import { Response, Request, NextFunction } from "express";
import { Post } from "../models";
import { FilesService } from "../services";
import { sendErr } from '../utils/sendError';

// Create instance of files service
let filesService = new FilesService();

export class FilesControllers {
    
    /**
     * This function is responsible for deleting a file
     * @param req 
     * @param res 
     * @param next 
     */
    async deleteAttached(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the fileId from the request
            let { fileName, postId, groupId } = req.body

            // If fileId is not found, then throw the error
            if (!fileName)
                return res.status(400).json({
                    message: 'Please pass the fileName in the request params'
                })

            // Get File on the basis of the fileName
            let file = await filesService.deleteAttachedFiles(fileName);

            if (postId) {
                await Post.findOneAndUpdate({
                    _id: postId
                  }, {
                    $pull: { files: { modified_name: fileName }}
                  }, {
                    new: true
                  });
            }

            // Send Status 200 response
            return res.status(200).json({
                message: 'File deleted!'
            })

        } catch (err) {
            return sendErr(res, err, 'Internal Server Error!', 500);
        }
    }

}