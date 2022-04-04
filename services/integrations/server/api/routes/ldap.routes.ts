import express from 'express';
import { Auths } from '../../utils';
import { Workspace } from '../models';

const routes = express.Router();

const ldap = require('ldapjs');

// Define auths helper controllers
const auths = new Auths();

routes.get('/ldapUserInfo', auths.verifyToken, auths.isLoggedIn, async (req, res) => {
    const { query: { workspaceId, email }} = req;

    let result = "";

    // Find user by user _id
    const workspace = await Workspace.findById(workspaceId).select('integrations');

    //Slack connected or not checking
    const isLdapConnected = workspace['integrations'].is_ldap_connected || false;
    if (isLdapConnected && email && workspace['integrations']) {
        const integrations = workspace['integrations'];
        var client = ldap.createClient({ url: integrations.ldap_url});
        client.bind(integrations.ldap_dn, integrations.ldap_password, (err) => { 
            if (err) {
                console.error(err);
            }

            result += "Reader bind succeeded\n";
            var opts = {
                filter: `(mail=${email})`,
                scope: 'sub'
                //attributes: ['*']
            };

            client.search(integrations.ldap_search_base, opts, (err, searchRes) => {
                if (err) {
                    result += "Search failed " + err;
                }
                
                searchRes.on("searchEntry", (entry) => {
                    //result += "Found entry: " + entry + "\n";
                    //searchList.push(entry.object);
                    res.send(entry.object);
                });

                searchRes.on("error", (err) => {
                    result += "Search failed with " + err;
                    res.send(result);
                });
                /*
                searchRes.on("end", (retVal) => {
                    result += "Search results length: " + searchList.length + "\n";
                    if (searchList.length > 1) {
                        for(var i = 0; i < searchList.length; i++)
                            result += "DN:" + searchList[i].dn + "\n";
                        result += "Search retval:" + retVal + "\n";
                    } else if (searchList.length == 1) {
                        ldapUser = searchList[0];
                    }
                    res.send(result);
                });   // searchRes.on("end",...)
                */
            });   // client.search
        });
    }
});

export { routes as ldapRoutes };