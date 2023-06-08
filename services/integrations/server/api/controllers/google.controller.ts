import { Response, Request, NextFunction } from "express";
import { User, Workspace } from '../models'
import { sendError } from '../../utils';
import { Readable } from 'stream';
import { JWT } from "google-auth-library";

const { google } = require('googleapis');
const { GoogleAuth, grpc } = require('google-gax');

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
                }, {
                    new: true
                })
                .populate({
                    path: 'members',
                    select: 'first_name last_name profile_pic role email active'
                })
                .lean();
console.log({ workspace });
console.log({ mapSelectedProperties });
            if (mapSelectedProperties) {
                const user = await User.findById(req['userId']).select('email').lean();
                const googleUsers = await this.listGoogleUsers(
                    'octonius-google-sync@octonius.iam.gserviceaccount.com'/*workspace?.integrations?.google_client_email*/,
                    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4iDkkjpWn2keD\nQFOC+U4B9GT0l3RVEh+y8yndEyRzDVUfQMatAhSnIf0AVSD7BUxjqezYgKKkSBK2\nyaSorfDzYF34SdDmzhXSUpewcaDeSL+Sye7qSGcWuRihUMStk0VlZfwbFZ+tztP6\nUixLYB7bYUOahajAVu35qk0wE3R+d5bi72HIee3YvB23T6lFtphOSWX0aDHaCa7g\n77azXMLFQVOU5UbZOL8ZFvdP9FwdHES/Bi+hyECosLHsPeDRTHtyoUQnHzy3aSA1\nav3xpOsUp5PvkfkWhSmrHq6jx5D2rsaH8joF+LVIBPr9UzhjbNUvneH9qSwFZ1Tn\nuHgKSHbrAgMBAAECggEAGZFiXYLWEI5Jd1Gb4JtbaCDtNgigKUNcGgbgJ44F8F0K\nDM0EWideJjQq4ndpHO7EgVCjjPHx1xJXaXUx99818frJumO76qbmViB0fRGZaQMq\nbBPHozWJ9xeJZpySy7wKkvyY/EW4PLRaIaZuFbmJPPtSix/23EOPMJccn8sqSnVZ\nnPGRK5THp44X3t/0hNtffS8ryL5DZggTRtVLXaZM0KKbk6RDDaM5fDPIHeetSb+k\nz5uxiw6zp1I/VVkw2QmzeGC7uVaiMtsOqGMTUiU34IdUrYi6Lm2DEgGrhmnCsy0N\nrtwXQwx/k1UdWxIoQ+O0L8vySpFcjBNbIIMRuQ0hOQKBgQD6zQFp/ObtGKTWtFSP\nLMZdZRC4jcVjP/+c8y/8F+6hn/NMiFD5xhboADUaOPqAzjXqr73YX0fr0S6Zh+d1\nI6jOl91YhZIQnd5CiInzuKN1LgIxJ+IbSZGEr9/CZwoUjIQ1CNiIdGGAHq2cTOUV\naQYFAiv3iJfBjoJfzZ09GFLpwwKBgQC8W4f+Rnc9sU+p/uJA4ZX9sJtWTaRlWgPx\nkQlgKvsJFd8nyZW7vxGuvfRkHIWHplN0SRc5w3lcqh8UYszoQOZ9nbzFVG98GH37\nTpVaFc55Y8zAJH+mywd6T9gTk8aaXuytGWOVCMCIts4GoBepU75rJoUgXEv7arQ1\nD1TVpZrDuQKBgQCuc37yTFoMvcGbHuBanth0CmKxHNwaB2Azuey8u6Dfh7TinUdG\nFgXE5rAJR2znv4g9cHTrVoteeqihXqkfD+jRm0z50B8js8vwF61tfBcm4RPhQU7D\nkE7KLtPEE4wtcvhbM4X6lIllZvF38PzAAceQIEyY58g3eHszTIB9CLhTpQKBgFVm\nYqhlJpcwF2CKEec84JafRi7BETJqt7MFAW06z4r1AbK2cU8oeEn0EiR50gkI3nmw\n0fj8qb/b2i+SBDmhg1+c7wPBHrLzH9uba5fmnzDmkOTlJ4NmNkO8g8mMjNVdCI4L\nHt1plHHoAE18tH2vXHyUgHOFpWWeoYoVI2+ioCLxAoGAKhTfUNyfZ9B/p158sECv\nG1irHs07Axm/o3gaOuiH97kEU+QXYwU+Gy8+vSRCjyOs+UiDSnVsoUMKeENNhA3e\nULC7Qz2o7ycKb0qT7oFwFxhpnEPvZM7QdeMr7xPagROs9JjAULRUjmJliwJ6Cn7C\nSui3jmL5Rjzawuulz/NnFzE=\n-----END PRIVATE KEY-----\n'/*workspace?.integrations?.google_client_secret_key*/,
                    user.email);
                // const googleUsers = await this.listGoogleUsers(workspace?.integrations?.google_api_key);
console.log({ googleUsers });
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

                    for (var entry of mapSelectedProperties.entries()) {
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
            }

            res.status(200).json({
                message: "Properties to Map Saved",
                workspace: workspace
            });
        } catch(err) {
            sendError(res, err);
        }
    }

    // private async listGoogleUsers(apiKey: string) {
    private async listGoogleUsers(service_client_email: string, private_key: string, userEmail: string) {
        
        // const client = new Compute({
        //     // Specifying the service account email is optional.
        //     serviceAccountEmail: client_email
        // });
        // const projectId = await auth.getProjectId();
        // const url = `GET https://admin.googleapis.com/admin/directory/v1/users?domain=DOMAIN_NAME&query=QUERY_PARAMETERS`;
        // const res = await client.request({url});
        // console.log(res.data);

        // const jwtClient = new google.auth.JWT(
        //     client_email,
        //     null,
        //     private_key,
        //     ['https://www.googleapis.com/auth/admin.directory.user'],
        //     "admin@domain" // Please change this accordingly
        // );
        // Create the Directory service.
        // const service = google.admin({version: 'directory_v1', auth: jwtClient});
// console.log({ client_email });
// console.log({ private_key });
// console.log({ apiKey });
        const client = new JWT(
            service_client_email,
            undefined,
            private_key.split(String.raw`\n`).join('\n'),
            ['https://www.googleapis.com/auth/admin.directory.user'],
            userEmail
        );
        await client.authorize();
        const service = google.admin('directory_v1');

        // const oauth2Client = new google.auth.OAuth2(
        //     YOUR_CLIENT_ID,
        //     YOUR_CLIENT_SECRET,
        //     YOUR_REDIRECT_URL
        // );

        // // generate a url that asks permissions for Blogger and Google Calendar scopes
        // const scopes = [
        //     'https://www.googleapis.com/auth/admin.directory.user'
        // ];

        // const url = oauth2Client.generateAuthUrl({
        //     // 'online' (default) or 'offline' (gets refresh_token)
        //     access_type: 'offline',
        //     // If you only need one scope you can pass it as a string
        //     scope: scopes
        // });
/////////////
        // const sslCreds = grpc.credentials.createSsl();
        // const googleAuth = new GoogleAuth();
        // const authClient = googleAuth.fromAPIKey(apiKey);
        // const credentials = grpc.credentials.combineChannelCredentials(
        //     sslCreds,
        //     grpc.credentials.createFromGoogleCredential(authClient)
        // );
        // //   return credentials;
        // const service = google.admin({ version: 'directory_v1', auth: credentials });
/////////////
        // const service = google.admin({ version: 'directory_v1', auth: apiKey });
/////////////
        // const keyFile = join(__dirname, '..', 'config', process.env.GOOGLE_AUTH_FILE);
        // // new google.auth.GoogleAuth({ keyFile: keyFile, scopes: this.scopes });
        // const auth = new google.auth.GoogleAuth({
        //     keyFile: keyFile,
        //     // keyFilename: 'PATH_TO_SERVICE_ACCOUNT_KEY.json',
        //     scopes: ['https://www.googleapis.com/auth/admin.directory.user']
        // });
        // const authClient = await auth.getClient();

        // const service = await google.admin({
        //     version: 'v1',
        //     auth: authClient
        // });

        const res = await service.users.list({
            // domain: myDomain,
            // auth: client,
            customer: 'my_customer'
        });
console.log(res.data);
        return res.data.users;
    }
}
