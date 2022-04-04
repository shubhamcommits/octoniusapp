/*  ===============================
 *  -- LDAP Service --
 *  ===============================
 */

import { Auths } from "../../utils";
import { sendErr } from "../../utils/sendError";
import { Account } from "../models";
const ldap = require('ldapjs');
//import SimpleLDAP from 'simple-ldap-search';

// Authentication Utilities Class
const auths = new Auths();

export class LDAPService {
    
    /** 
     * 
     */
    async ldapUserInfo(integrations: any, email: string, password: string) {
        /*
        let account = await Account.findOne({
            email: email
        }).select('email password').lean();
        */
        let result = "";
        const pwd = await auths.decryptData('password', password);
        var client = ldap.createClient({ url: integrations.ldap_url});
        client.bind(integrations.ldap_dn, integrations.ldap_password, (err) => { 
            if (err) {
                console.error(err);
            }
            
            result += "Reader bind succeeded\n";
            var opts = {
                filter: `(uid=${email})`,
                scope: 'sub'
                //attributes: ['*']
            };

            /*
            //client.search(integrations.ldap_dn, opts, function(err, res) {
            //client.search('ou=mathematicians', opts, (err, res) => {
            client.search(integrations.ldap_search_base, opts, (err, res) => {
console.error(err);
console.info(res);
                res.on('searchEntry', (entry) => {
                    const user = JSON.stringify(entry.object);
console.log({ entry });
                    return user;
                });

                res.on('searchReference', (referral) => {
                    console.log('referral: ' + referral.uris.join());
                });

                res.on('error', (err) => {
                    console.error('error: ' + err.message);
                });

                res.on('end', (result) => {
                    console.log('status: ' + result.status);
                });
            });
            */
            client.search(integrations.ldap_dn, opts, (err, searchRes) => {
				var searchList = [];
				
				if (err) {
					result += "Search failed " + err;
					//res.send(result);
					return;
				}
				
				searchRes.on("searchEntry", (entry) => {
					result += "Found entry: " + entry + "\n";
					searchList.push(entry);
				});

				searchRes.on("error", (err) => {
					result += "Search failed with " + err;
					//res.send(result);
				});
				
				searchRes.on("end", (retVal) => {
					result += "Search results length: " + searchList.length + "\n";
					for(var i = 0; i < searchList.length; i++) 
						result += "DN:" + searchList[i].objectName + "\n";
					result += "Search retval:" + retVal + "\n";					
					
					if (searchList.length === 1) {					
						client.bind(searchList[0].objectName, pwd, function(err) {
							if (err) 
								result += "Bind with real credential error: " + err;
							else
								result += "Bind with real credential is a success";
								
							//res.send(result);	
						});  // client.bind (real credential)
						
						
					} else { // if (searchList.length === 1)
						result += "No unique user to bind";
						//res.send(result);
					}
                    return searchList;
				});   // searchRes.on("end",...)
				
		    });   // client.search
        });
    }

    async ldapUserInfo2(res: any, integrations: any, email: string, password: string) {
        const pwd = await auths.decryptData('password', password.toString());
        let user;
        var client = ldap.createClient({ url: integrations.ldap_url});
        client.bind(integrations.ldap_dn, integrations.ldap_password, (err) => { 
            if (err) {
                console.error(err);
            }
            const uid = email.split('@')[0];
            var opts = {
                filter: `(uid=${uid})`,
                scope: 'sub'
                //attributes: ['*']
            };

            client.search(integrations.ldap_search_base, opts, (err, searchRes) => {
                if (err) {
                    console.error("Search failed " + err);
                }
                
                searchRes.on("searchEntry", (entry) => {
                    user = JSON.stringify(entry.object);
console.log('1111: ' + user);
                    res.send(user);
                });

                searchRes.on("error", (err) => {
                    console.error('error: ' + err);
                });
                
                searchRes.on("end", (retVal) => {
                    console.log('status: ' + retVal.status);
console.log('2222: ' + user);
                });   // searchRes.on("end",...)
                
            });   // client.search
        });
console.log('3333: ' + user);
        return user;
    }
}
