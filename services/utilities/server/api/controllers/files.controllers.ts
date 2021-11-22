import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils/senderror";
import { FilesService, FoldersService } from "../services";
import axios from 'axios';
// Create instance of files service
let filesService = new FilesService();

// Create instance of folders service
let foldersService = new FoldersService();

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
            let { query: { groupId, lastFileId, folderId } } = req;

            // Files List
            let files: any = [];

            // Get files list
            if (lastFileId == undefined || lastFileId == 'undefined') {
                if (folderId == undefined || folderId == 'undefined' || folderId == null || folderId == 'null') {
                    files = await filesService.get(groupId.toString(), null);
                } else {
                    files = await filesService.get(groupId.toString(), folderId.toString());
                }
            }else {
                if (folderId == undefined || folderId == 'undefined' || folderId == null || folderId == 'null') {
                    files = await filesService.get(groupId.toString(), null, lastFileId.toString());
                } else {
                    files = await filesService.get(groupId.toString(), folderId.toString(), lastFileId.toString());
                }
            }

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
     * This function is responsible for fetching a file details
     * @param req 
     * @param res 
     * @param next 
     */
    async getOne(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the fileId from the request
            let { fileId } = req.params

            // If fileId is not found, then throw the error
            if (!fileId)
                return res.status(400).json({
                    message: 'Please pass the fileId in the request params'
                })

            // Get File on the basis of the fileId
            let file = await filesService.getOne(fileId)

            // Send Status 200 response
            return res.status(200).json({
                message: 'File details retrieved!',
                file: file
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the campaign type file
     * @param req 
     * @param res 
     * @param next 
     */
     async getCampaignFile(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the groupId from the request
            let { groupId } = req.query;

            // If groupId is not found, then throw the error
            if (!groupId)
                return res.status(400).json({
                    message: 'Please pass groupId in the request params'
                })

            // Get File on the basis of the fileId
            let file = await filesService.getCampaignFile(groupId)

            // Send Status 200 response
            return res.status(200).json({
                message: 'File details retrieved!',
                file: file
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for editing a file details
     * @param req 
     * @param res 
     * @param next 
     */
    async edit(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the fileId from the request
            const { params: { fileId }, body: { file } } = req;

            // If fileId is not found, then throw the error
            if (!fileId)
                return res.status(400).json({
                    message: 'Please pass the fileId in the request params'
                })

            // Get File on the basis of the fileId
            let fileData = await filesService.edit(fileId, file)

            // Send Status 200 response
            return res.status(200).json({
                message: 'File details edited!',
                file: fileData
            })

        } catch (err) {
            return sendError(res, new Error('Internal Server Error!'), 'Internal Server Error!', 500);
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

            if(fileData && fileData.type == 'flamingo'){
                await axios.post(`${process.env.FLAMINGO_SERVER_API}/create-flamingo`,
                    {
                        flamingoData: { _file: fileData._id }
                    },
                    {
                        headers: { Authorization: req.headers.authorization }
                    });
            }

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
            let { query: { groupId, query, postRef } } = req;

            // Files List
            let files = [];

            // TODO try to add a join query in the searchFiles method instead of making two calls to the DB
            let groupsIdArray = [];
            if (postRef === 'true') {
                await filesService.findGroupsShareFiles(groupId.toString()).then(groups => {
                    groupsIdArray = groups;
                });
            }

            groupsIdArray.push(groupId.toString());

            // Get files list
            files = await filesService.searchFiles(groupsIdArray, query);

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
     * This function is responsible for deleting a file
     * @param req 
     * @param res 
     * @param next 
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the fileId from the request
            const { params: { fileId }, body: { flamingoType } } = req;

            // If fileId is not found, then throw the error
            if (!fileId)
                return res.status(400).json({
                    message: 'Please pass the fileId in the request params'
                })

            // Get File on the basis of the fileId
            let file = await filesService.delete(fileId, flamingoType);

            // Send Status 200 response
            return res.status(200).json({
                message: 'File deleted!'
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for copying a folio to a group
     * @param req 
     * @param res 
     * @param next 
     */
    async copy(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the fileId from the request
            const { params: { fileId }, body: { groupId } } = req;

            // If fileId is not found, then throw the error
            if (!fileId && !groupId) {
                return res.status(400).json({
                    message: 'Please pass the fileId and groupId'
                });
            }

            // Copy the folio
            let fileData = await filesService.copy(fileId, groupId);

            // Send Status 200 response
            return res.status(200).json({
                message: 'Folio copied!',
                file: fileData
            })

        } catch (err) {
            return sendError(res, new Error('Internal Server Error!'), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for moving a folio to a group
     * @param req 
     * @param res 
     * @param next 
     */
    async move(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the fileId from the request
            const { params: { fileId }, body: { groupId } } = req;

            // If fileId is not found, then throw the error
            if (!fileId &&  !groupId) {
                return res.status(400).json({
                    message: 'Please pass the fileId and groupId'
                });
            }

            // Move the folio
            let fileData = await filesService.move(fileId, groupId);

            // Send Status 200 response
            return res.status(200).json({
                message: 'Folio moved!',
                file: fileData
            })

        } catch (err) {
            return sendError(res, new Error('Internal Server Error!'), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for moving a file to a folder
     * @param req 
     * @param res 
     * @param next 
     */
    async moveToFolder(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the fileId from the request
            const { params: { fileId }, body: { folderId } } = req;

            // If fileId is not found, then throw the error
            if (!fileId &&  !folderId) {
                return res.status(400).json({
                    message: 'Please pass the fileId and folderId'
                });
            }

            // Move the folio
            let fileData = await filesService.moveToFolder(fileId, folderId);

            // Send Status 200 response
            return res.status(200).json({
                message: 'File moved!',
                file: fileData
            })

        } catch (err) {
            return sendError(res, new Error('Internal Server Error!'), 'Internal Server Error!', 500);
        }
    }

    async saveCustomField(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];

            // Fetch the groupId
            const { fileId } = req.params;

            // Fetch the newCustomField from fileHandler middleware
            const customFieldValue = req.body['customFieldValue'];
            const customFieldName = req.body['customFieldName'];

            let file = await filesService.changeCustomFieldValue(fileId, customFieldName, customFieldValue);

            if (!file['custom_fields']) {
                file['custom_fields'] = new Map<string, string>();
            }
            file.custom_fields[customFieldName] = customFieldValue;

            // Send status 200 response
            return res.status(200).json({
                message: 'Custom Field updated!',
                file: file
            });
        } catch(err) {
            return sendError(res, new Error(err), 'Bad Request, please check into error stack!', 400);
        }
    }
}