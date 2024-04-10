import e, { Response, Request, NextFunction } from "express";
import { OAUTH_SCOPES, SUBSCRIPTION_CLIENT_STATE, processEncryptedNotification, processNotification, isTokenValid, sendError, renewSubscription } from '../../utils';

const msal = require('@azure/msal-node');
import { getGraphClientForUser } from "../../utils";
import { User, Workspace } from "../models";
import { MSAuthProvider } from "../service/msAuth.service";

const msAuthProvider = new MSAuthProvider();

/*  ===============================
 *  -- MS CONTROLLERS --
 *  ===============================
 */
export class MSController {

    /**
     * This function is responsible for retrieving the ms365 token for the particular user
     * @param { userId }req 
     * @param res 
     */
    async getMS365Token(req: Request, res: Response, next: NextFunction) {
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
                ms365Token: user.integrations.ms_365.token
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function is responsible for updating the ms365 token for the particular user
     * @param { userId, token }req 
     * @param res 
     */
     async addMS365Token(req, res: Response, next: NextFunction) {
        try{
            const { body: { ms365Code/*, ms365ClientInfo, ms365SessionState, workspaceId*/ }} = req;
            const userId = req['userId'];

            // Prepare the callback url
            let callBackUrl = `${process.env.PROTOCOL}://localhost:${process.env.CLIENT_PORT}/dashboard/user/clouds`;
            
            // Check if the env is production
            if(process.env.NODE_ENV == 'production') {
                callBackUrl = `${process.env.PROTOCOL}://${process.env.DOMAIN}/dashboard/user/clouds`;
            }

            let user;
            if (!req.app.locals.msalClient) {
                user = await User.findById({
                    _id: userId
                }).select('_workspace').lean();

                const workspace = await Workspace.findById({_id: user._workspace})
                    .select('integrations')
                    .lean();

                msAuthProvider.initMSALClient(req, res, next, workspace?.integrations);
            }
            
            const tokenRequest = {
                code: ms365Code,
                scopes: OAUTH_SCOPES.split(','),
                redirectUri: callBackUrl,
            };
console.log({tokenRequest});
            const response = await req.app.locals.msalClient.acquireTokenByCode(tokenRequest);
console.log({response});
// Save the user's homeAccountId in their session
            const userAccountId = response.account.homeAccountId;
            const token = response.accessToken;
            const client = getGraphClientForUser(
                req.app.locals.msalClient,
                userAccountId,
            );
console.log({client});
            // Get the user's profile from Microsoft Graph
            // await client.api('/me').select('displayName, mail').get();

            const msUser = {
                token: token,
                userAccountId: userAccountId,
            };
console.log({msUser});
            user = await User.findByIdAndUpdate(
                {
                    _id: userId
                }, {
                    $set: {
                        'integrations.ms_365': {
                            token: token,
                            // email_subscription_id: subscription._id,
                            user_account_id: userAccountId,
                            enabled_mail_subscription: false
                        }
                    }
                }, {
                    new: true
                })
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                }).lean();
console.log(user.integrations);
            return res.status(200).json({
                message: 'Saved ms365 token.',
                user: user,
                msUser: msUser
            });
        } catch (err) {
console.log(err);
            return sendError(res, err);
        }
    }

    async subscribeToMails(req, res, next) {
        try {
            const userId = req['userId'];
            let user = await User.findById(
                {
                    _id: userId
                }).select('_workspace integrations').lean();
            
            if (!req.app.locals.msalClient) {
                const workspace = await Workspace.findById({_id: user._workspace})
                    .select('integrations')
                    .lean();

                msAuthProvider.initMSALClient(req, res, next, workspace?.integrations);
            }
            
            const client = getGraphClientForUser(
                req.app.locals.msalClient,
                user.integrations.ms_365.user_account_id,
            );

            // If in production, use the current host to receive notifications
            // In development, must use an ngrok proxy
            // const notificationHost = process.env.NODE_ENV === 'production' ? `${req.protocol}://${req.hostname}` : process.env.NGROK_PROXY;
            const notificationHost = process.env.NODE_ENV === 'production'
                ? `${process.env.PROTOCOL}://${process.env.HOST}/api/ms365`
                : `https://392b-83-52-63-220.ngrok-free.app/api/ms365`;
                // : `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/api/ms365`;
            // http://localhost:13000/api/ms365/callback

            // Create the subscription
            const subscription = await client.api('/subscriptions').create({
                changeType: 'created',
                notificationUrl: `${notificationHost}/listen`,
                lifecycleNotificationUrl: `${notificationHost}/lifecycle`,
                resource: 'me/mailFolders/inbox/messages',
                clientState: SUBSCRIPTION_CLIENT_STATE,
                includeResourceData: false,
                expirationDateTime: new Date(Date.now() + 3600000).toISOString(),
            });
console.log(subscription);
            user = await User.findByIdAndUpdate(
                {
                    _id: userId
                }, {
                    $set: {
                        'integrations.ms_365': {
                            email_subscription_id: subscription._id,
                            enabled_mail_subscription: true,
                        }
                    }
                }, {
                    new: true
                })
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                }).lean();

            return res.status(200).json({
                message: 'Subscribed to Emails',
                user: user,
            });
        } catch (err) {
console.log(err);
            return sendError(res, err);
        }
    }

    async removeMailSubscription(req, res, next) {
        try {
            const userId = req['userId'];
            let user = await User.findById(
                {
                    _id: userId
                }).select('integrations _workspace').lean();
            
            if (!!user.integrations.ms_365.email_subscription_id) {
                if (!req.app.locals.msalClient) {
                    const workspace = await Workspace.findById({_id: user._workspace})
                        .select('integrations')
                        .lean();

                    msAuthProvider.initMSALClient(req, res, next, workspace?.integrations);
                }
                
                const client = getGraphClientForUser(
                    req.app.locals.msalClient,
                    user.integrations.ms_365.user_account_id,
                );
                
                await client.api(`/subscriptions/${user.integrations.ms_365.email_subscription_id}`).delete();
                
                user = await User.findByIdAndUpdate(
                    {
                        _id: userId
                    }, {
                        $set: {
                            'integrations.ms_365': {
                                email_subscription_id: '',
                                enabled_mail_subscription: false,
                            }
                        }
                    }, {
                        new: true
                    })
                    .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                    .populate({
                        path: 'stats.favorite_groups',
                        select: '_id group_name group_avatar'
                    })
                    .populate({
                        path: 'stats.favorite_portfolios',
                        select: '_id portfolio_name portfolio_avatar'
                    })
                    .populate({
                        path: 'stats.favorite_collections',
                        select: '_id name collection_avatar'
                    })
                    .populate({
                        path: '_groups',
                        select: '_id group_name group_avatar'
                    })
                    .populate({
                        path: '_account',
                        select: '_id email _workspaces first_name last_name created_date'
                    }).lean();
            }
                    
            return res.status(200).json({
                message: "Token revoked!",
                user: user
            });
        } catch (err) {
console.log(err);
            return sendError(res, err);
        }
    }

    /**
     * This is the notification endpoint Microsoft Graph sends notifications to
     * 
     * If there is a validationToken parameter
     * in the query string, this is the endpoint validation
     * request sent by Microsoft Graph. Return the token
     * as plain text with a 200 response
     * 
     * https://learn.microsoft.com/graph/webhooks#notification-endpoint-validation
     * 
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    async listenWebhook(req, res, next) {
        try {
            if (req.query && req.query.validationToken) {
                res.set('Content-Type', 'text/plain');
                res.send(req.query.validationToken);
                return;
            }
            console.log(JSON.stringify(req.body, null, 2));

            // Check for validation tokens, validate them if present
            let areTokensValid = true;
            if (req.body.validationTokens) {
                const appId = process.env.OAUTH_CLIENT_ID;
                const tenantId = process.env.OAUTH_TENANT_ID;
                const validationResults = await Promise.all(
                    req.body.validationTokens.map((token) =>
                        isTokenValid(token, appId, tenantId),
                    ),
                );

                areTokensValid = validationResults.reduce((x, y) => x && y);
            }

            if (areTokensValid) {
                for (let i = 0; i < req.body.value.length; i++) {
                    const notification = req.body.value[i];

                    // Verify the client state matches the expected value
                    if (notification.clientState == SUBSCRIPTION_CLIENT_STATE) {
                        // Verify we have a matching subscription record in the database
                        // const subscription = await dbHelper.getSubscription(
                        //     notification.subscriptionId,
                        // );

                        const user: any = await User.findOne({
                                $and: [
                                    { 'integrations.ms_365.email_subscription_id': notification.subscriptionId },
                                    { active: true }
                                ]
                            })
                            .select('integrations')
                            .populate({
                                path: '_workspace',
                                select: 'integrations'
                            })
                            .lean();
console.log(user._workspace);
                        if (!!user) {
                            // If notification has encrypted content, process that
                            if (notification.encryptedContent) {
                                processEncryptedNotification(notification, user._workspace.ms_365_private_key_path);
                            } else {
                                await processNotification(
                                    notification,
                                    req.app.locals.msalClient,
                                    user.integrations.ms_365.user_account_id,
                                );
                            }
                        }
                    }
                }
            }

            res.status(202).end();
        } catch (err) {
console.log(err);
            return sendError(res, err);
        }
    }

    /**
     * 
     * This is the notification endpoint Microsoft Graph sends notifications to
     * If there is a validationToken parameter
     * in the query string, this is the endpoint validation
     * request sent by Microsoft Graph. Return the token
     * as plain text with a 200 response
     * 
     * https://learn.microsoft.com/graph/webhooks#notification-endpoint-validation
     * 
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    async lifecycleWebhook(req, res, next) {
        try {
            if (req.query && req.query.validationToken) {
                res.set('Content-Type', 'text/plain');
                res.send(req.query.validationToken);
                return;
            }

            console.log(JSON.stringify(req.body, null, 2));

            for (let i = 0; i < req.body.value.length; i++) {
                const notification = req.body.value[i];

                // Verify the client state matches the expected value and that this is a lifecycle notification
                if (notification.clientState === SUBSCRIPTION_CLIENT_STATE && notification.lifecycleEvent === 'reauthorizationRequired') {
                    // Verify we have a matching subscription record in the database
                    const user: any = await User.findOne({
                            $and: [
                                { 'integrations.ms_365.email_subscription_id': notification.subscriptionId },
                                { active: true }
                            ]
                        }).select('integrations');

                    if (!!user && !!user.integrations && !!user.integrations.ms_365) {
                        // Renew the subscription
                        await renewSubscription(user.integrations.ms_365, req.app.locals.msalClient);
                    }
                }
            }

            res.status(202).end();
        } catch (err) {
console.log(err);
            return sendError(res, err);
        }
    }

    async authMS365(req, res, next) {
        try {
            const { params: { workspaceId }} = req;

            const workspace: any = await Workspace.findById({ _id: workspaceId }).select('integrations').lean();

            if (!workspace || !workspace.integrations  || !workspace.integrations.is_ms_365_connected || !workspace.integrations.ms_365_client_id || !workspace.integrations.ms_365_client_secret) {
                return sendError(res, new Error('Unable to find the workspace, or workspace is missing MS365 configuration!'), 'Unable to find the workspace, or workspace is missing MS365 configuration!', 404);
            }

            const msalInstance = msAuthProvider.initMSALClient(req, res, next, workspace?.integrations);

            // Prepare the callback url
            let callBackUrl = `${process.env.PROTOCOL}://localhost:${process.env.CLIENT_PORT}/dashboard/user/clouds`;

            // Check if the env is production
            if(process.env.NODE_ENV == 'production') {
                callBackUrl = `${process.env.PROTOCOL}://${process.env.DOMAIN}/dashboard/user/clouds`;
            }

            // Microsoft identity platform redirects the browser here with the
            // authorization result
            const urlParameters = {
                // code: req.query.code,
                scopes: OAUTH_SCOPES.split(','),
                redirectUri: callBackUrl,
                prompt: 'select_account',
            };
            const authUrl = await msalInstance.getAuthCodeUrl(urlParameters);

            return res.status(200).json({
                authorize_url: authUrl
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function is responsible for retrieving the ms365 token for the particular user
     * @param { userId }req 
     * @param res 
     */
    async searchFiles(req: Request, res: Response, next: NextFunction) {
        try {
            const { query: { query }} = req;
            const userId = req['userId'];

            const user: any = await User.findOne({
                $and: [
                    { _id: userId },
                    { active: true }
                ]
            }).select('integrations _workspace');

            // If user not found
            if (!user) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            if (!req.app.locals.msalClient) {
                const workspace = await Workspace.findById({_id: user._workspace})
                    .select('integrations')
                    .lean();

                msAuthProvider.initMSALClient(req, res, next, workspace?.integrations);
            }

            const client = getGraphClientForUser(
                    req.app.locals.msalClient,
                    user.integrations.ms_365.user_account_id,
                );
console.log({client});
            let filesResponse = await client.api(`/me/drive/search(q='${query}')`).get();
console.log({filesResponse});
            // Send status 200 response
            return res.status(200).json({
                files: filesResponse.value
            });
        } catch (err) {
console.log(err);
            return sendError(res, err);
        }
    }

    /**
     * This function is responsible for disconnecting the ms365 cloud
     */
    async disconnectMS365Cloud(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];
            let user = await User.findById(
                {
                    _id: userId
                }).select('integrations _workspace').lean();

            if (!!user.integrations.ms_365.email_subscription_id) {
                if (!req.app.locals.msalClient) {
                    const workspace = await Workspace.findById({_id: user._workspace})
                        .select('integrations')
                        .lean();

                    msAuthProvider.initMSALClient(req, res, next, workspace?.integrations);
                }

                const client = getGraphClientForUser(
                    req.app.locals.msalClient,
                    user.integrations.ms_365.user_account_id,
                );
                
                await client.api(`/subscriptions/${user.integrations.ms_365.email_subscription_id}`).delete();
            }

            user = await User.findByIdAndUpdate(
                {
                    _id: userId
                }, {
                    $set: {
                        'integrations.ms_365': {
                            token: '',
                            email_subscription_id: '',
                            user_account_id: '',
                            enabled_mail_subscription: false,
                        }
                    }
                }, {
                    new: true
                })
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                }).lean();

            return res.status(200).json({
                message: "Token revoked!",
                user: user
            });
        } catch (err) {
            return sendError(res, err);
        }
    }
}
