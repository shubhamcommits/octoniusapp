import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils/senderror";
import { File } from "../models";

export class FilesPermissionsControllers {

    /**
     * This function is used to 
     * @param req 
     * @param res 
     * @param next 
     */
    async selectPermissionRight(req: Request, res: Response, next: NextFunction) {
        try {
            const fileId = req.params.fileId;
            const permissionId = req.body.permissionId;
            const right = req.body.right;
            
            if (permissionId) {
                let file: any = await File.findByIdAndUpdate(
                    { _id: fileId },
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
                    message: 'File updated successfully!',
                    file: file
                });
            } else {
                let file: any = await File.findById({ _id: fileId });
                let permission = file['permissions'].create({
                    right: right,
                    rags: [],
                    _members:[] 
                });
                file['permissions'].push(permission);
                file.save();

                file = await File.findById(fileId).lean();

                // Send Status 200 response
                return res.status(200).json({
                    message: 'File updated successfully!',
                    file: file,
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
            const fileId = req.params.fileId;
            const permissionId = req.body.permissionId;

            await File.findByIdAndUpdate(
                { _id: fileId },
                {
                    $pull: {
                        permissions: {
                            _id: permissionId
                        }
                    }
                }).lean();

            // Send Status 200 response
            return res.status(200).json({
                message: 'File deleted!'
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
            const fileId = req.params.fileId;
            const permissionId = req.body.permissionId;
            const tag = req.body.tag;
            
            let file: any;

            file = await File.findByIdAndUpdate(
                { _id: fileId },
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
                message: 'File updated successfully!',
                file: file
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
            const fileId = req.params.fileId;
            const permissionId = req.body.permissionId;
            const tag = req.body.tag;
            
            let file: any;

            file = await File.findByIdAndUpdate(
                { _id: fileId },
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
                message: 'File updated successfully!',
                file: file
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
            const fileId = req.params.fileId;
            const permissionId = req.body.permissionId;
            const member = req.body.member;
            
            let file: any;

            file = await File.findByIdAndUpdate(
                { _id: fileId },
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
                message: 'File updated successfully!',
                file: file,
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
            const fileId = req.params.fileId;
            const permissionId = req.body.permissionId;
            const memberId = req.body.memberId;
            
            let file: any;

            file = await File.findByIdAndUpdate(
                { _id: fileId },
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
                message: 'File updated successfully!',
                file: file
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}