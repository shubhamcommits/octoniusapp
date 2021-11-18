import { sendError } from "../../utils";

const { authenticate } = require('ldap-authentication')

export default class LDAPAuthService {
    
    constructor() {
    }

    async auth(email: string, password: string, workplaceLDAPIntegration: any) {
        let user;
        try {
            // auth with admin
            let options: any = {
                ldapOpts: {
                    url: workplaceLDAPIntegration.ldap_url,
                },
                adminDn: workplaceLDAPIntegration.ldap_dn,
                adminPassword: workplaceLDAPIntegration.ldap_password,
                userPassword: password,
                userSearchBase: workplaceLDAPIntegration.ldap_search_base,
                usernameAttribute: 'mail',
                username: email
            }
            user = await authenticate(options);
            return user;
        } catch (err) {
            console.log(`\n⛔️ Error: Email not found on LDAP!`, err);
        }
        return user;
    }
}