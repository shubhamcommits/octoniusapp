import { Response, Request, NextFunction } from "express";
import { User, Workspace } from '../models'
import { sendError } from '../../utils';

const ldap = require('ldapjs');

/*  ===============================
 *  -- LDAP CONTROLLERS --
 *  ===============================
 */
export class LdapController {

    /** 
     * @param req 
     * @param res 
     * @param next 
     */
    async ldapUserInfoProperties(req: Request, res: Response, next: NextFunction) {
        const { workspaceId } = req.params;
        const { query: { email, global }} = req;

        try {
            let searchList = [];
            // Find workspace by workspace _id
            const workspace = await Workspace.findById(workspaceId).select('integrations');

            //Slack connected or not checking
            const isLdapConnected = workspace['integrations'].is_ldap_connected || false;
            if (isLdapConnected && email && workspace['integrations']) {
                const integrations = workspace['integrations'];

                var client = ldap.createClient({ url: integrations.ldap_url, reconnect: false });
                client.bind(integrations.ldap_dn, integrations.ldap_password, (err) => { 
                    if (err) {
                        console.error(err);
                    }

                    //let opts = {};
                    //if (global == 'true') {
                    //    const domain = email.toString().split('@')[1];
                    //    opts = {
                    //        filter: `(mail=*@${domain})`,
                    //        scope: 'sub',
                    //        timeLimit: 6000,
                    //        sizeLimit: 1
                    //        //attributes: ['*']
                    //    };
                    //} else {
                    let opts = {
                        filter: `(mail=${email})`,
                        scope: 'sub',
                        timeLimit: 6000
                        //attributes: ['*']
                    };
                    //}

                    client.search(integrations.ldap_search_base, opts, (err, searchRes) => {
                        if (err) {
                            sendError(res, err);
                        }
                        
                        searchRes.on("searchEntry", (entry) => {
                            searchList.push(entry.object);
                        });

                        searchRes.on("error", (err) => {
                            sendError(res, err);
                        });

                        searchRes.on("end", (retVal) => {
                            client.unbind();
                            client.destroy();

                            const emptyReturn: string[] = [];
                            
                            if (global == 'true') {
                                //res.send(Object.keys(searchList[0]));
                                res.status(200).json({
                                    ldapPropertiesNames: (searchList && searchList[0]) ? Object.keys(searchList[0]) : emptyReturn
                                });
                            } else {
                                //res.send(searchList[0]);
                                res.status(200).json({
                                    userLdapData: (searchList && searchList[0]) ? searchList[0] : emptyReturn
                                });
                            }
                        });   // searchRes.on("end",...)
                    });   // client.search
                });
            }
        } catch (err) {
            sendError(res, err);
        }
    }

    /** 
     * @param req 
     * @param res 
     * @param next 
     */
    async ldapWorkspaceUsersInfo(req: Request, res: Response, next: NextFunction) {
        // Fetch the workspaceId
        const { workspaceId } = req.params;

        // Find the custom field in a workspace and remove the value
        const ldapPropertiesToMap = req.body['ldapPropertiesToMap'];
        const mapSelectedProperties = req.body['mapSelectedProperties'];
        const userProperties = req.body['userProperties'];
        const email = req.body['email'];
        const global = req.body['global'];

        try {
            let searchList = [];
            // Find workspace by workspace _id
            const workspace = await Workspace.findByIdAndUpdate(workspaceId, {
                $set: {
                    ldapPropertiesMap: mapSelectedProperties,
                    ldap_user_properties_cf: userProperties
                }
            }).select('integrations');

            const integrations = workspace['integrations'];

            //Slack connected or not checking
            const isLdapConnected = integrations.is_ldap_connected || false;
            if (isLdapConnected && email && integrations) {

                var client = ldap.createClient({ url: integrations.ldap_url, reconnect: false });
                client.bind(integrations.ldap_dn, integrations.ldap_password, (err) => { 
                    if (err) {
                        console.error(err);
                    }

                    let opts = {};
                    if (global) {
                        const domain = email.toString().split('@')[1];
                        opts = {
                            filter: `(mail=*@${domain})`,
                            scope: 'sub',
                            timeLimit: 6000,
                            sizeLimit: 100000
                        };
                    } else {
                        opts = {
                            filter: `(mail=${email})`,
                            scope: 'sub',
                            timeLimit: 6000,
                            sizeLimit: 100000
                        };
                    }

                    client.search(integrations.ldap_search_base, opts, (err, searchRes) => {
                        if (err) {
                            sendError(res, err);
                        }
                        
                        searchRes.on("searchEntry", (entry) => {
                            searchList.push(entry.object);
                        });

                        searchRes.on("error", (err) => {
                            sendError(res, err);
                        });

                        searchRes.on("end", (retVal) => {
                            let octoniusUserNoGlobal;
                            searchList.forEach(async ldapUser => {
                                const user = await User.findOne({
                                    $and: [
                                        { _workspace: workspaceId },
                                        { email: ldapUser['mail'] }
                                    ]}).select('_id profile_custom_fields').lean();

                                if (user) {
                                    octoniusUserNoGlobal = await User.findById(user._id);

                                    if (!octoniusUserNoGlobal['profile_custom_fields']) {
                                        octoniusUserNoGlobal['profile_custom_fields'] = new Map<string, string>();
                                    }

                                    let userProfileCustomFields: any = user['profile_custom_fields'];
                                    if (!userProfileCustomFields) {
                                        userProfileCustomFields = {};
                                    }

                                    if (ldapPropertiesToMap) {
                                        for (let i = 0; i < ldapPropertiesToMap.length; i++) {
                                            const property = ldapPropertiesToMap[i];
                                            if (userProperties.findIndex(userProperty => userProperty == property) >= 0) {
                                                const userOctonius = await User.findOne({
                                                    $and: [
                                                        { _workspace: workspaceId },
                                                        { email: ldapUser[property] }
                                                    ]}).select('_id').lean();

                                                if (userOctonius) {
                                                    octoniusUserNoGlobal['profile_custom_fields'].set(mapSelectedProperties[property], userOctonius._id);
                                            
                                                    // Find the post and update the custom field
                                                    octoniusUserNoGlobal = await User.findByIdAndUpdate({
                                                        _id: user._id
                                                    }, {
                                                        $set: { "profile_custom_fields": octoniusUserNoGlobal['profile_custom_fields'] }
                                                    }), {
                                                        new: true
                                                    };
                                                }
                                            } else if (mapSelectedProperties[property]) {
                                                octoniusUserNoGlobal['profile_custom_fields'].set(mapSelectedProperties[property], ldapUser[property]);
                                        
                                                // Find the post and update the custom field
                                                octoniusUserNoGlobal = await User.findByIdAndUpdate({
                                                    _id: user._id
                                                }, {
                                                    $set: { "profile_custom_fields": octoniusUserNoGlobal['profile_custom_fields'] }
                                                }), {
                                                    new: true
                                                };
                                            }
                                        }
                                    }
                                }
                            });

                            client.unbind();
                            client.destroy();
                            //res.send("All users profile fields have been mapped");
                            res.status(200).json({
                                message: "All users profile fields have been mapped",
                                user: octoniusUserNoGlobal
                            });
                        });   // searchRes.on("end",...)
                    });   // client.search
                });
            }
        } catch(err) {
            sendError(res, err);
        }
    }
}
