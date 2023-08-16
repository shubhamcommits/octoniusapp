import jwt from "jsonwebtoken";
import { Auth } from "../../api/models";
import { Request, Response, NextFunction } from 'express';
import { sendError } from "../senderror";
import { File } from '../../api/models';
export class Auths {

    /**
     * This function verifies the token coming from the request authorization headers
     * It returns and feeds the userId into req object for future use
     * @param req 
     * @param res 
     * @param next 
     */
    async verifyToken(req: Request, res: Response, next: NextFunction) {
        try {
            var url = require('url');
            var url_parts = url.parse(req.url, true);
            var query = url_parts.query;

            // Allow this situation for when selecting a workplace where user is not login yet
            if (query.noAuth || query.readOnly) {
                next();
            } else {
                let token = query?.authToken?.split(' ')[1];
                // Authorization header is not present on request
                if (!req.headers.authorization && !token) {
                    return res.status(401).json({
                        message: 'Unauthorized request, it must include an authorization header!'
                    })
                }

                if (!token) {
                    // Split the authorization header
                    token = req.headers.authorization.split(' ')[1]
                }

                // Token is not present on authorization header
                if (!token) {
                    return res.status(401).json({
                        message: 'Unauthorized request, it must include an authorization token!'
                    })
                }

                // Verify the token
                jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
                    if (err || !decoded) {
                        // Send status 401 response
                        return res.status(401).json({
                            message: 'Unauthorized request, it must have a valid authorization token!'
                        })
                    } else {
                        // Assigning and feeding the userId into the req object
                        req['userId'] = decoded['subject']
                        next();
                    }
                });
            }
        } catch (err) {
            return sendError(res, err);
        }
    };/**
     * This function verifies the token coming from the request authorization headers
     * It returns and feeds the userId into req object for future use
     * @param req 
     * @param res 
     * @param next 
     */
    async verifyLOOLToken(req: Request, res: Response, next: NextFunction) {
        try {
            var url = require('url');
            var url_parts = url.parse(req.url, true);
            var query = url_parts.query;

            // Allow this situation for when selecting a workplace where user is not login yet
            if (query.noAuth || query.readOnly) {
                next();
            } else {
                let token = query?.access_token?.split(' ')[1];
                // Authorization header is not present on request
                if (!req.headers.authorization && !token) {
                    return res.status(401).json({
                        message: 'Unauthorized request, it must include an authorization header!'
                    })
                }

                if (!token) {
                    // Split the authorization header
                    token = req.headers.authorization.split(' ')[1]
                }

                // Token is not present on authorization header
                if (!token) {
                    return res.status(401).json({
                        message: 'Unauthorized request, it must include an authorization token!'
                    })
                }

                // Verify the token
                jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
                    if (err || !decoded) {
                        // Send status 401 response
                        return res.status(401).json({
                            message: 'Unauthorized request, it must have a valid authorization token!'
                        })
                    } else {
                        // Assigning and feeding the userId into the req object
                        req['userId'] = decoded['subject']
                        next();
                    }
                });
            }
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function verifies if a user is currently loggedIn or not
     * @param req 
     * @param res 
     * @param next 
     */
    async isLoggedIn(req: Request, res: Response, next: NextFunction) {
        try {
            var url = require('url');
            var url_parts = url.parse(req.url, true);
            var query = url_parts.query;

            // Allow this situation for when selecting a workplace where user is not login yet
            // and in the highlight directive
            // TODO - find a solution to secure this calls
            // if (query.noAuth && url_parts.pathname.includes('/workspaces/')) {
            if (query.noAuth || query.authToken || query.readOnly) {
                next();
            } else {
                // Find the authentication logs
                const auth = await Auth.findOne({
                    _user: req['userId'],
                    isLoggedIn: true,
                    token: req.headers.authorization.split(' ')[1]
                });

                // If logs are found
                if (!!auth) {
                    // Send status 200 response
                    next();
                } else {
                    // Send status 200 response
                    return res.status(401).json({
                        message: 'Unauthorized request, Please signIn to continue!',
                    });
                }
            }
        } catch (err) {
            return sendError(res, err, 'Unauthorized request, Please sign In to continue!', 401)
        }
    };

    /**
     * This function generates the new jwt token and logs the authentication record 
     * @param { query: { user, workspace_name } }req 
     * @param res 
     * @param next 
     */
    async generateToken(req: Request, res: Response, next: NextFunction) {

        // Fetch the data from the request body
        const { userId, workspace } = req.query;

        try {

            // Generate token payload
            const payload = {
                subject: userId
            };

            // Creating token
            const token = jwt.sign(payload, process.env.JWT_KEY);

            // Throw and catch the jwt error
            if (!token) {
                return res.status(400).json({
                    message: 'Unable to generate the token!',
                    error: new Error('Unable to generate the token!')
                })
            }

            // Initialize new auth record
            const newAuth = {
                workspace_name: workspace,
                _user: userId,
                token: token
            };

            // Create new auth record
            const auth = await Auth.create(newAuth)
                .catch(() => {
                    return res.status(400).json({
                        message: 'Unable to log the auth record creation, some unexpected error occurred!',
                        error: new Error('Unable to log the auth record creation, some unexpected error occurred!')
                    })
                })

            // Error on auth creation
            if (!auth) {
                return res.status(400).json({
                    message: 'Unable to log the auth record creation, some unexpected error occurred!',
                    error: new Error('Unable to log the auth record creation, some unexpected error occurred!')
                })
            }

            // Resolve the promise with token
            return res.status(200).json({
                message: 'Token generated successfully!',
                token: token
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }

    }

    /**
     * This function is responsible for signing out a user
     * @param req 
     * @param res 
     * @param next 
     */
    async signOut(req: Request, res: Response, next: NextFunction) {
        try {

            req['userId'] = '';
            req.headers.authorization = undefined

            // Send the status 200 response 
            return res.status(200).json({
                message: 'User logged out!',
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async canUserEditFileAction(item: any, userData: any, parentFileId?: string) {
        const isGroupManager = (item._group && item._group._admins) ? (item._group?._admins.findIndex((admin: any) => (admin?._id || admin) == userData?._id) >= 0) : false;
        let createdBy = (item?._posted_by ) ? (item?._posted_by?._id == userData?._id) : false;
        createdBy = (!createdBy && item?._created_by) ? (item?._created_by?._id == userData?._id) : createdBy;
    
        if (item?.approval_flow_launched) {
          return false;
        }

        if (userData?.role == 'admin' || userData?.role == 'owner' || createdBy || isGroupManager) {
          return true;
        } else {
          let canDoRagAction = false;
          if (item._group?.enabled_rights) {
            if (item?.permissions && item?.permissions?.length > 0) {
              item.permissions.forEach(permission => {
                const groupRagIndex = (item._group?.rags) ? item._group?.rags?.findIndex(groupRag => permission.rags.includes(groupRag.rag_tag)) : -1;
                let groupRag;
                if (groupRagIndex >= 0) {
                  groupRag = item._group?.rags[groupRagIndex];
                }
    
                const userRagIndex = (groupRag && groupRag._members) ? groupRag._members.findIndex(ragMember => (ragMember?._id || ragMember) == userData?._id) : -1;
                const userPermissionIndex = (permission && permission._members) ? permission._members.findIndex(permissionMember => (permissionMember?._id || permissionMember) == userData?._id) : -1;
                if ((userRagIndex >= 0 || userPermissionIndex >= 0) && permission.right == 'edit') {
                  canDoRagAction = true;
                }
              });
            } else if (parentFileId) {
                const parentFile: any = await File.populate(File.findById(parentFileId), [
                    { path: '_group', select: 'rags' },
                    { path: 'permissions._members', select: '_id' }
                ]);

                if (parentFile?.permissions && parentFile?.permissions?.length > 0) {
                    parentFile.permissions.forEach(permission => {
                      const groupRagIndex = (parentFile._group?.rags) ? parentFile._group?.rags?.findIndex(groupRag => permission.rags.includes(groupRag.rag_tag)) : -1;
                      let groupRag;
                      if (groupRagIndex >= 0) {
                        groupRag = parentFile._group?.rags[groupRagIndex];
                      }
          
                      const userRagIndex = (groupRag && groupRag._members) ? groupRag._members.findIndex(ragMember => (ragMember?._id || ragMember) == userData?._id) : -1;
                      const userPermissionIndex = (permission && permission._members) ? permission._members.findIndex(permissionMember => (permissionMember?._id || permissionMember) == userData?._id) : -1;
                      if ((userRagIndex >= 0 || userPermissionIndex >= 0) && permission.right == 'edit') {
                        canDoRagAction = true;
                      }
                    });
                  }
            } else if (item?._folder || item?._parent) {
                canDoRagAction = this.checkParentFolderRagAction(item?._folder || item?._parent, item._group, userData);
            } else {
                canDoRagAction = true;
            }
          }
    
          return (!item._group?.enabled_rights || canDoRagAction) && (!item?._group?.files_for_admins || isGroupManager);
        }
    }

    checkParentFolderRagAction(item: any, groupData: any, userData: any) {
        let canDoRagAction = false;
        if (item?.permissions && item?.permissions?.length > 0) {
    
          item?.permissions.forEach(permission => {
            const groupRagIndex = (groupData?.rags) ? groupData?.rags?.findIndex(groupRag => permission.rags.includes(groupRag.rag_tag)) : -1;
            let groupRag;
            if (groupRagIndex >= 0) {
              groupRag = groupData?.rags[groupRagIndex];
            }
    
            const userRagIndex = (groupRag && groupRag._members) ? groupRag._members.findIndex(ragMember => (ragMember?._id || ragMember) == userData?._id) : -1;
            const userPermissionIndex = (permission && permission._members) ? permission._members.findIndex(permissionMember => (permissionMember?._id || permissionMember) == userData?._id) : -1;
            if ((userRagIndex >= 0 || userPermissionIndex >= 0) && permission.right == 'edit') {
              canDoRagAction = true;
            }
          });
        } else if (item?._parent) {
          canDoRagAction = this.checkParentFolderRagAction(item?._parent, groupData, userData);
        } else {
          canDoRagAction = true;
        }
    
        return canDoRagAction;
    }

}