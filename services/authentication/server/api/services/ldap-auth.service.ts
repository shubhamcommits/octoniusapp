import { sendError } from "../../utils";

const { authenticate } = require('ldap-authentication')

export default class LDAPAuthService {
    
    constructor() {
    }

    async auth(email: string, password: string) {
        let user;
        try {
            // auth with admin
            let options: any = {
                ldapOpts: {
                    url: process.env.LDAP_URL,
                },
                adminDn: process.env.LDAP_DN,
                adminPassword: process.env.LDAP_PASSWORD,
                userPassword: password,
                userSearchBase: process.env.LDAP_SEARCH_BASE,
                usernameAttribute: 'mail',
                username: email
            }
            user = await authenticate(options);
            return user;
        } catch (err) {
            console.log(`\n⛔️ Error: Email not found on LDAP!`);
        }
        return user;
    }
}