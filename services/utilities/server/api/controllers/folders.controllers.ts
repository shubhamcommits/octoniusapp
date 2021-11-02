import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils/senderror";
import { FoldersService } from "../services";

// Create instance of folders service
let foldersService = new FoldersService();

export class FoldersControllers {

    /**
     * This function is used to fetch list of the folders
     * @param req 
     * @param res 
     * @param next 
     */
    async get(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the Folder Name From the request
            let { query: { groupId, folderId } } = req;

            // Folders List
            let folders: any = []

            // Get folders list
            if (folderId == undefined || folderId == 'undefined' || folderId == null || folderId == 'null') {
                folders = await foldersService.get(groupId.toString());
            } else {
                folders = await foldersService.get(groupId.toString(), folderId.toString());
            }

            // Send Status 200 response
            return res.status(200).json({
                message: 'Folders list fetched!',
                folders: folders
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is used to fetch list of the folders
     * @param req 
     * @param res 
     * @param next 
     */
    async getFolders(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the Folder Name From the request
            let { query: { folderId } } = req;

            // Folders List
            let folders: any = []

            // Get folders list
            folders = await foldersService.getFolders(folderId.toString());

            // Send Status 200 response
            return res.status(200).json({
                message: 'Folders list fetched!',
                folders: folders
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching a folder details
     * @param req 
     * @param res 
     * @param next 
     */
    async getOne(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the folderId from the request
            let { folderId } = req.params

            // If folderId is not found, then throw the error
            if (!folderId)
                return res.status(400).json({
                    message: 'Please pass the folderId in the request params'
                })

            // Get Folder on the basis of the folderId
            let folder = await foldersService.getOne(folderId)

            // Send Status 200 response
            return res.status(200).json({
                message: 'Folder details retrieved!',
                folder: folder
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for editing a folder details
     * @param req 
     * @param res 
     * @param next 
     */
    async edit(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the folderId from the request
            const { params: { folderId }, body: { folderName } } = req;

            // If folderId is not found, then throw the error
            if (!folderId)
                return res.status(400).json({
                    message: 'Please pass the folderId in the request params'
                })

            // Get Folder on the basis of the folderId
            let folderData = await foldersService.edit(folderId, folderName)

            // Send Status 200 response
            return res.status(200).json({
                message: 'Folder name edited!',
                folder: folderData
            })

        } catch (err) {
            return sendError(res, new Error('Internal Server Error!'), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is the boiler plate for adding folders to the group
     * @param req 
     * @param res 
     * @param next 
     */
    async add(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the Folder Name From the request
            let { body: { folderData } } = req;

            folderData = JSON.parse(folderData);

            // Create the folder
            folderData = await foldersService.add(folderData);

            // Send Status 200 response
            return res.status(200).json({
                message: 'Folder has been uploaded!',
                folder: folderData
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for deleting a folder
     * @param req 
     * @param res 
     * @param next 
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the folderId from the request
            let { folderId } = req.params

            // If folderId is not found, then throw the error
            if (!folderId)
                return res.status(400).json({
                    message: 'Please pass the folderId in the request params'
                })

            // Get Folder on the basis of the folderId
            let folder = await foldersService.remove(folderId)

            // Send Status 200 response
            return res.status(200).json({
                message: 'Folder deleted!'
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for moving a folder to another folder
     * @param req 
     * @param res 
     * @param next 
     */
    async moveToFolder(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the folderId from the request
            const { params: { folderId }, body: { parentFolderId } } = req;

            // If folderId is not found, then throw the error
            if (!parentFolderId &&  !folderId) {
                return res.status(400).json({
                    message: 'Please pass the folderId and parentFolderId'
                });
            }

            // Move the folio
            let folderData = await foldersService.moveToFolder(folderId, parentFolderId);

            // Send Status 200 response
            return res.status(200).json({
                message: 'Folder moved!',
                folder: folderData
            })

        } catch (err) {
            return sendError(res, new Error('Internal Server Error!'), 'Internal Server Error!', 500);
        }
    }

    async addRagToPost(req: Request, res: Response, next: NextFunction) {
        const { folderId } = req.params;
        const { rag } = req.body;

        const post = await foldersService.addRag(folderId, rag)
            .catch((err) => {
                return sendError(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            });

        // Send status 200 response
        return res.status(200).json({
            message: 'Task rag updated!',
            post: post
        });
    }
    async removeRagFromPost(req: Request, res: Response, next: NextFunction) {
        const { folderId } = req.params;
        const { rag } = req.body;

        const post = await foldersService.removeRag(folderId, rag)
            .catch((err) => {
                return sendError(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            });

        // Send status 200 response
        return res.status(200).json({
            message: 'Task rag updated!',
            post: post
        });
    }
}