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

                    let opts = {};
                    if (global == 'true') {
                        const domain = email.toString().split('@')[1];
                        opts = {
                            filter: `(mail=*@${domain})`,
                            scope: 'sub'
                            //attributes: ['*']
                        };
                    } else {
                        opts = {
                            filter: `(mail=${email})`,
                            scope: 'sub'
                            //attributes: ['*']
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
                            client.unbind();
                            client.destroy();
                            
                            if (global == 'true') {
                                //res.send(Object.keys(searchList[0]));
                                res.status(200).json({
                                    ldapPropertiesNames: Object.keys(searchList[0])
                                });
                            } else {
                                //res.send(searchList[0]);
                                res.status(200).json({
                                    userLdapData: searchList[0]
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
                            scope: 'sub'
                            //attributes: ['*']
                        };
                    } else {
                        opts = {
                            filter: `(mail=${email})`,
                            scope: 'sub'
                            //attributes: ['*']
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
                                    let userProfileCustomFields: any = user['profile_custom_fields'];
                                    if (!userProfileCustomFields) {
                                        userProfileCustomFields = {};
                                    }
                                    //(Object.keys(mapSelectedProperties)).forEach(property => {
                                    ldapPropertiesToMap.forEach(async property => {
                                        if (userProperties.findIndex(userProperty => userProperty == property) >= 0) {
                                            const userOctonius = await User.findOne({
                                                $and: [
                                                    { _workspace: workspaceId },
                                                    { email: ldapUser[property] }
                                                ]}).select('_id').lean();

                                            if (userOctonius) {
                                                ldapUser[property] = userOctonius._id;
                                            }
                                        }
                                        /*
                                        //let managerMail;
                                        // if (property == 'manager' && ldapUser[property] && ldapUser[property].toLowerCase().startsWith('cn=')) {
                                        if (property == 'mail' && ldapUser[property]) {
                                            let opts2 = {
                                                filter: ldapUser[property],
                                                scope: 'sub',
                                                attributes: ['mail']
                                            }

                                            client.search(integrations.ldap_search_base, opts2, (err2, res2) => {
                                                if (err2) {
                                                    sendError(res, err2);
                                                }
                                                
                                                res2.on('searchEntry', function (entry2) {
                                                    managerMail = entry2.object;
                                                });
                        
                                                res2.on("error", (err3) => {
                                                    sendError(res, err3);
                                                });
                                            });

                                            //if (managerMail) {
                                                const userOctonius = await User.findOne({
                                                    $and: [
                                                        { _workspace: workspaceId },
                                                        { email: ldapUser[property] }
                                                        //{ email: managerMail.mail }
                                                    ]}).select('_id').lean();

                                                ldapUser[property] = userOctonius._id;
                                            //}
console.log(ldapUser[property]);
console.log(userOctonius);
                                        }
                                        */
                                        userProfileCustomFields[mapSelectedProperties[property]] = ldapUser[property];
                                    });

                                    octoniusUserNoGlobal = await User.findByIdAndUpdate({
                                            _id: user._id
                                        }, {
                                            $set: { "profile_custom_fields": userProfileCustomFields }
                                        }), {
                                            new: true
                                        };
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
