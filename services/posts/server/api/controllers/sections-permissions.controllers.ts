import { Response, Request, NextFunction } from "express";
import { sendError } from "../utils";
import { Column } from "../models";

export class SectionsPermissionsControllers {

    /**
     * This function is used to 
     * @param req 
     * @param res 
     * @param next 
     */
    async selectPermissionRight(req: Request, res: Response, next: NextFunction) {
        try {
            const sectionId = req.params.sectionId;
            const permissionId = req.body.permissionId;
            const right = req.body.right;
            
            if (permissionId) {
                let section: any = await Column.findByIdAndUpdate(
                    { _id: sectionId },
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
                    message: 'Section updated successfully!',
                    section: section
                });
            } else {
                let section: any = await Column.findById({ _id: sectionId });
                let permission = section['permissions'].create({
                    right: right,
                    rags: [],
                    _members:[] 
                });
                section['permissions'].push(permission);
                section.save();

                section = await Column.findById(sectionId).lean();

                // Send Status 200 response
                return res.status(200).json({
                    message: 'Section updated successfully!',
                    section: section,
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
            const sectionId = req.params.sectionId;
            const permissionId = req.body.permissionId;

            await Column.findByIdAndUpdate(
                { _id: sectionId },
                {
                    $pull: {
                        permissions: {
                            _id: permissionId
                        }
                    }
                }).lean();

            // Send Status 200 response
            return res.status(200).json({
                message: 'Section deleted!'
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
            const sectionId = req.params.sectionId;
            const permissionId = req.body.permissionId;
            const tag = req.body.tag;
            
            let section: any;

            //file = await File.create(file);
            section = await Column.findByIdAndUpdate(
                { _id: sectionId },
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
                message: 'Section updated successfully!',
                section: section
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
            const sectionId = req.params.sectionId;
            const permissionId = req.body.permissionId;
            const tag = req.body.tag;
            
            let section: any;

            //file = await File.create(file);
            section = await Column.findByIdAndUpdate(
                { _id: sectionId },
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
                message: 'Section updated successfully!',
                section: section
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
            const sectionId = req.params.sectionId;
            const permissionId = req.body.permissionId;
            const member = req.body.member;
            
            let section: any;

            //file = await File.create(file);
            section = await Column.findByIdAndUpdate(
                { _id: sectionId },
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
                message: 'Section updated successfully!',
                section: section,
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
            const sectionId = req.params.sectionId;
            const permissionId = req.body.permissionId;
            const memberId = req.body.memberId;
            
            let section: any;

            //file = await File.create(file);
            section = await Column.findByIdAndUpdate(
                { _id: sectionId },
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
                message: 'Section updated successfully!',
                section: section
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}