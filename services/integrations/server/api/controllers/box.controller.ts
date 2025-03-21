import { Account, Group, User, Workspace } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError } from '../../utils';

var BoxSDK = require('box-node-sdk');

/*  ===================
 *  -- BOX METHODS --
 *  ===================
 * */
export class BoxControllers {

    /**
     * This function is responsible for updating the box token for the particular user
     * @param { userId, token }req 
     * @param res 
     */
     async addBoxToken(req: Request, res: Response, next: NextFunction) {
        try{
            const { body: { token }} = req;
            const userId = req['userId'];

            let user = await User.findById(
                {
                    _id: userId
                }).select('integrations').lean();
            if (user.integrations.box) {
                user = await User.findByIdAndUpdate(
                    {
                        _id: userId
                    }, {
                        'integrations.box.token': token
                    }, {
                        new: true
                    });
            } else {
                const box = {
                    token: token
                }
                user = await User.findByIdAndUpdate(
                    {
                        _id: userId
                    }, {
                        'integrations.box': box
                    }, {
                        new: true
                    });
            }
            
        
            return res.status(200).json({
                message: 'Saved box token.',
                user
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function is responsible for retrieving the box token for the particular user
     * @param { userId }req 
     * @param res 
     */
    async getBoxToken(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];
            
            const user: any = await User.findOne({
                $and: [
                    { _id: userId },
                    { active: true }
                ]
            }).select('integrations');

            // If user not found
            if (!user) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Send status 200 response
            return res.status(200).json({
                boxToken: user.integrations.box.token
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    async authBox(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { workspaceId }, query: { redirect_uri }} = req;

            const workspace: any = await Workspace.findById({ _id: workspaceId }).select('integrations').lean();

            if (!workspace || !workspace.integrations  || !workspace.integrations.is_box_connected || !workspace.integrations.box_client_id || !workspace.integrations.box_client_secret_key) {
                return sendError(res, new Error('Unable to find the workspace, or workspace is missing Box configuration!'), 'Unable to find the workspace, or workspace is missing Box configuration!', 404);
            }

            if (!redirect_uri) {
                return sendError(res, new Error('Redirect URL for Box was not provided!'), 'Redirect URL for Box was not provided!', 404);
            }

            // Initialize the SDK with your app credentials
            var sdk = new BoxSDK({
                clientID: workspace.integrations.box_client_id,
                clientSecret: workspace.integrations.box_client_secret_key
            });

            // the URL to redirect the user to
            var authorize_url = sdk.getAuthorizeURL({
                response_type: 'code',
                redirect_uri: redirect_uri
            });

            return res.status(200).json({
                authorize_url: authorize_url
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function is responsible for retrieving the box token for the particular user
     * @param { userId }req 
     * @param res 
     */
    async getBoxUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];
            const { query: { accessToken, workspaceId }} = req;
            
            const workspace: any = await Workspace.findOne({ _id: workspaceId }).select('integrations');

            // If user not found
            if (!workspace) {
                return sendError(res, new Error('Unable to find the workspace, either workspaceId is invalid or you have made an unauthorized request!'), 'Unable to find the workspace, either workspaceId is invalid or you have made an unauthorized request!', 404);
            }

            // Initialize the SDK with your app credentials
            var sdk = new BoxSDK({
                clientID: workspace.integrations.box_client_id,
                clientSecret: workspace.integrations.box_client_secret_key
            });

            var client = sdk.getBasicClient(accessToken);

            client.users.get(client.CURRENT_USER_ID).then(currentUser => {
                // Send status 200 response
                return res.status(200).json({
                    user: currentUser
                });
            }).catch(err => sendError(res, err));
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function is responsible for disconnecting the box cloud
     */
    disconnectBoxCloud(req: Request, res: Response, next: NextFunction) {

        const { body: { accessToken, box_client_id, box_client_secret_key }} = req;

        try {
            // Initialize the SDK with your app credentials
            var sdk = new BoxSDK({
                clientID: box_client_id,
                clientSecret: box_client_secret_key
            });

            // Create a basic API client, which does not automatically refresh the access token
            var client = sdk.getBasicClient(accessToken);

            // Revoke the token
            client.revokeTokens(accessToken);

            return res.status(200).json({
                message: "Token revoked!"
            });
        } catch (err) {
            return sendError(res, err);
        }
    }
}