import { Response, Request, NextFunction } from "express";
import { User, Workspace } from '../models'
import { sendError } from '../../utils';
import { Readable } from 'stream';

const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');


/*  ===============================
 *  -- LDAP CONTROLLERS --
 *  ===============================
 */
export class GoogleController {

    // SCOPES = [
    //     'https://www.googleapis.com/auth/admin.directory.user.readonly'
    // ];

    /** 
     * @param req 
     * @param res 
     * @param next 
     */
//     async googleUserInfoProperties(req: Request, res: Response, next: NextFunction) {
//         const { workspaceId } = req.params;
//         const { query: { email, global }} = req;

//         try {
//             let searchList = [];
//             // Find workspace by workspace _id
//             const workspace = await Workspace.findById(workspaceId).select('integrations');

//             //Slack connected or not checking
//             const isGoogleConnected = workspace['integrations'].is_google_connected || false;
//             if (isGoogleConnected && email && workspace['integrations']) {
//                 const integrations = workspace['integrations'];

//                 const auth = new google.auth.JWT(
//                     email,
//                     null,
//                     integrations.google_client_secret_key,
//                     this.scopes,
//                     email
//                 );
                
//                 // const auth = new google.auth.getClient(
//                 //     keyFile: {},
//                 //     scopes: this.scopes
//                 // )
                
//                 // obtain the admin client
//                 // const admin = await google.admin({
//                 //     version: 'directory_v1',
//                 //     auth,
//                 // });

//                 // const auth = new google.auth.OAuth2(
//                 //     integrations.google_client_id,
//                 //     integrations.google_client_secret_key,
//                 //     process.env.clientURL
//                 // );

//                 google.options({auth});

//                 // set auth as a global default
//                 const admin = google.admin({
//                     version: 'directory_v1',
//                     auth: auth
//                 });

//                 admin.groups.get({ groupKey: email })
//                 // admin.schemas.get(/*{customerId: integrations.google_client_id, schemaKey: null }*/)
//                 .then(res => {
// console.log(res);
//                 });
//             }
//         } catch (err) {
//             sendError(res, err);
//         }
//     }

    /** 
     * @param req 
     * @param res 
     * @param next 
     */
    async googleWorkspaceUsersInfo(req: Request, res: Response, next: NextFunction) {
        // Fetch the workspaceId
        const { workspaceId } = req.params;

        const mapSelectedProperties = req.body['mapSelectedProperties'];

        try {
            const workspace = await Workspace.findByIdAndUpdate(workspaceId, {
                    $set: {
                        googlePropertiesMap: mapSelectedProperties
                    }
                })
                .populate({
                    path: 'members',
                    select: 'first_name last_name profile_pic role email active'
                })
                .lean();
console.log(workspace?.googlePropertiesMap);
            const googleUsers = await this.listGoogleUsers(workspace?.integrations?.google_api_id)
console.log({googleUsers});
            const googleUserStream = Readable.from(googleUsers);
            await googleUserStream.on('data', async (googleUser: any) => {
                let octoUser = await User.findOneAndUpdate({
                        $and: [
                            { email: googleUser.primaryEmail },
                            { _workspace: workspaceId }
                        ]
                    }).lean();
                
                if (!octoUser['profile_custom_fields']) {
                    octoUser['profile_custom_fields'] = new Map();
                }

                for (var entry of workspace?.googlePropertiesMap.entries()) {
                    var octoProperty = entry[0];
                    var googleProperty = entry[1]; // [SCHEMA, FIELD]
                    if (googleUser?.customSchemas && googleUser?.customSchemas[googleProperty[0]] && googleUser?.customSchemas[googleProperty[0]][googleProperty[1]]) {
                        octoUser['profile_custom_fields'].set(mapSelectedProperties[octoProperty], googleUser?.customSchemas[googleProperty[0]][googleProperty[1]]);
                    }
                }

                await User.findOneAndUpdate({
                    $and: [
                      { email: googleUser.primaryEmail },
                      { _workspace: workspaceId }
                    ]
                  }, {
                    $set: {
                      profile_custom_fields: octoUser['profile_custom_fields']
                    }
                  });
            });

            res.status(200).json({
                message: "Properties to Map Saved",
                workspace: workspace
            });
        } catch(err) {
            sendError(res, err);
        }
    }

    private async listGoogleUsers(apiKey: string) {
        const service = google.admin({ version: 'directory_v1', auth: apiKey });
        const res = await service.users.list({
            customer: 'my_customer'
        });

        return res.data.users;
    }
}
