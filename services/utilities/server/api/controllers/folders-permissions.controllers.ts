import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils/senderror";
import { Folder } from "../models";

export class FoldersPermissionsControllers {

    /**
     * This function is used to 
     * @param req 
     * @param res 
     * @param next 
     */
    async selectPermissionRight(req: Request, res: Response, next: NextFunction) {
        try {
            const folderId = req.params.folderId;
            const permissionId = req.body.permissionId;
            const right = req.body.right;
            
            if (permissionId) {
                let folder: any = await Folder.findByIdAndUpdate(
                    { _id: folderId },
                    {
                        $set: {
                            "permissions.$[permission].right": right
                        }
                    },
                    {
                        arrayFilters: [{ "permission._id": permissionId }],
                        new: true
                    })
                    .lean();
            
                // Send Status 200 response
                return res.status(200).json({
                    message: 'Folder updated successfully!',
                    folder: folder
                });
            } else {
                let folder: any = await Folder.findById({ _id: folderId });
                let permission = folder['permissions'].create({
                    right: right,
                    rags: [],
                    _members:[] 
                });
                folder['permissions'].push(permission);
                folder.save();

                folder = await Folder.findById(folderId).lean();

                // Send Status 200 response
                return res.status(200).json({
                    message: 'Folder updated successfully!',
                    folder: folder,
                    permissionId: permission._id
                });
            }
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is used to 
     * @param req 
     * @param res 
     * @param next 
     */
    async removePermission(req: Request, res: Response, next: NextFunction) {
        try {
            const folderId = req.params.folderId;
            const permissionId = req.body.permissionId;

            await Folder.findByIdAndUpdate(
                { _id: folderId },
                {
                    $pull: {
                        permissions: {
                            _id: permissionId
                        }
                    }
                }).lean();

            // Send Status 200 response
            return res.status(200).json({
                message: 'Folder deleted!'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is used to 
     * @param req 
     * @param res 
     * @param next 
     */
    async addTagToPermission(req: Request, res: Response, next: NextFunction) {
        try {
            const folderId = req.params.folderId;
            const permissionId = req.body.permissionId;
            const tag = req.body.tag;
            
            let folder: any;

            folder = await Folder.findByIdAndUpdate(
                { _id: folderId },
                {
                    $addToSet: {
                        "permissions.$[permission].rags": tag
                    }
                },
                {
                    arrayFilters: [{ "permission._id": permissionId }],
                    new: true
                }).lean();
            
            // Send Status 200 response
            return res.status(200).json({
                message: 'Folder updated successfully!',
                folder: folder
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is used to 
     * @param req 
     * @param res 
     * @param next 
     */
    async removePermissionTag(req: Request, res: Response, next: NextFunction) {
        try {
            const folderId = req.params.folderId;
            const permissionId = req.body.permissionId;
            const tag = req.body.tag;
            
            let folder: any;

            folder = await Folder.findByIdAndUpdate(
                { _id: folderId },
                {
                    $pull: {
                        "permissions.$[permission].rags": tag
                    }
                },
                {
                    arrayFilters: [{ "permission._id": permissionId }],
                    new: true
                }).lean();
            
            // Send Status 200 response
            return res.status(200).json({
                message: 'Folder updated successfully!',
                folder: folder
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is used to 
     * @param req 
     * @param res 
     * @param next 
     */
    async addMemberToPermission(req: Request, res: Response, next: NextFunction) {
        try {
            const folderId = req.params.folderId;
            const permissionId = req.body.permissionId;
            const member = req.body.member;
            
            let folder: any;

            folder = await Folder.findByIdAndUpdate(
                { _id: folderId },
                {
                    $addToSet: {
                        "permissions.$[permission]._members": member
                    }
                },
                {
                    arrayFilters: [{ "permission._id": permissionId }],
                    new: true
                }).lean();
            
            // Send Status 200 response
            return res.status(200).json({
                message: 'Folder updated successfully!',
                folder: folder,
                member: member
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is used to 
     * @param req 
     * @param res 
     * @param next 
     */
    async removeMemberFromPermission(req: Request, res: Response, next: NextFunction) {
        try {
            const folderId = req.params.folderId;
            const permissionId = req.body.permissionId;
            const memberId = req.body.memberId;
            
            let folder: any;

            folder = await Folder.findByIdAndUpdate(
                { _id: folderId },
                {
                    $pull: {
                        "permissions.$[permission]._members": memberId
                    }
                },
                {
                    arrayFilters: [{ "permission._id": permissionId }],
                    new: true
                }).lean();
            
            // Send Status 200 response
            return res.status(200).json({
                message: 'Folder updated successfully!',
                folder: folder
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}