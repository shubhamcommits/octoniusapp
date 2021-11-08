import { Response, Request, NextFunction } from "express";
import { sendError } from "../utils";
import { Post } from "../models";

export class PostsPermissionsControllers {

    /**
     * This function is used to 
     * @param req 
     * @param res 
     * @param next 
     */
    async selectPermissionRight(req: Request, res: Response, next: NextFunction) {
        try {
            const postId = req.params.postId;
            const permissionId = req.body.permissionId;
            const right = req.body.right;
            
            if (permissionId) {
                let post: any = await Post.findByIdAndUpdate(
                    { _id: postId },
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
                    message: 'Post updated successfully!',
                    post: post
                });
            } else {
                let post: any = await Post.findById({ _id: postId });
                let permission = post['permissions'].create({
                    right: right,
                    rags: [],
                    _members:[] 
                });
                post['permissions'].push(permission);
                post.save();

                post = await Post.findById(postId).lean();

                // Send Status 200 response
                return res.status(200).json({
                    message: 'Post updated successfully!',
                    post: post,
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
            const postId = req.params.postId;
            const permissionId = req.body.permissionId;

            await Post.findByIdAndUpdate(
                { _id: postId },
                {
                    $pull: {
                        permissions: {
                            _id: permissionId
                        }
                    }
                }).lean();

            // Send Status 200 response
            return res.status(200).json({
                message: 'Post deleted!'
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
            const postId = req.params.postId;
            const permissionId = req.body.permissionId;
            const tag = req.body.tag;
            
            let post: any;

            //post = await Post.create(post);
            post = await Post.findByIdAndUpdate(
                { _id: postId },
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
                message: 'Post updated successfully!',
                post: post
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
            const postId = req.params.postId;
            const permissionId = req.body.permissionId;
            const tag = req.body.tag;
            
            let post: any;

            //post = await Post.create(post);
            post = await Post.findByIdAndUpdate(
                { _id: postId },
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
                message: 'Post updated successfully!',
                post: post
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
            const postId = req.params.postId;
            const permissionId = req.body.permissionId;
            const member = req.body.member;
            
            let post: any;

            //post = await Post.create(post);
            post = await Post.findByIdAndUpdate(
                { _id: postId },
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
                message: 'Post updated successfully!',
                post: post,
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
            const postId = req.params.postId;
            const permissionId = req.body.permissionId;
            const memberId = req.body.memberId;
            
            let post: any;

            //post = await Post.create(post);
            post = await Post.findByIdAndUpdate(
                { _id: postId },
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
                message: 'Post updated successfully!',
                post: post
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}