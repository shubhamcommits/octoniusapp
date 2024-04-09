const msal = require('@azure/msal-node');
const axios = require('axios');

// const { msalConfig } = require('../authConfig');

export class MSAuthProvider {
    // msalConfig;
    // cryptoProvider;

    constructor() {
    };

    initMSALClient(req, res, next, workspaceIntegrations) {
        try {
            const msalConfig = {
                auth: {
                    clientId: workspaceIntegrations?.ms_365_client_id,
                    authority: `${workspaceIntegrations?.ms_365_authority}/${workspaceIntegrations?.ms_365_tenant_id}`,
                    clientSecret: workspaceIntegrations?.ms_365_client_secret,
                },
                system: {
                    loggerOptions: {
                        loggerCallback(logLevel, message, containsPii) {
                            console.log(message);
                        },
                        piiLoggingEnabled: false,
                        logLevel: msal.LogLevel.Error,
                    },
                },
            };
            return this.getMsalInstance(req, msalConfig);
        } catch (error) {
console.log(error);
            throw error;
        }
    }

    /**
     * Instantiates a new MSAL ConfidentialClientApplication object
     * @param msalConfig: MSAL Node Configuration object 
     * @returns 
     */
    getMsalInstance(req, msalConfig) {
        if (!!req?.app?.locals?.msalClient) {
            return req.app.locals.msalClient;
        }

        const msalInstance = new msal.ConfidentialClientApplication(msalConfig);
        req.app.locals.msalClient = msalInstance;
        return msalInstance;
    }
}