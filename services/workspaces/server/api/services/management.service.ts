import { axios } from '../../utils';

/*  ===============================
 *  -- Management Service --
 *  ===============================
 */
export class ManagementService {

    MANAGEMENT_BASE_API_URL = process.env.MANAGEMENT_URL + '/api';

    /* | ======================================= BILLING ========================================== | */

    createClientPortalSession(workspaceId: string, return_url: string, mgmtApiPrivateKey: string) {
        try {
            return axios.post(`${this.MANAGEMENT_BASE_API_URL}/billings/create-client-portal-session`, {
                workspaceId: workspaceId,
                return_url: return_url,
                API_KEY: mgmtApiPrivateKey
            });
        } catch (err) {
         throw (err);
        }
    }

    createStripeCheckoutSession(priceId: string, workspaceId: string, return_url: string, mgmtApiPrivateKey: string) {
        try {
            return axios.post(`${this.MANAGEMENT_BASE_API_URL}/billings/create-checkout-session`, {
                priceId: priceId,
                workspaceId: workspaceId,
                return_url: return_url,
                API_KEY: mgmtApiPrivateKey
            });
        } catch (err) {
            throw (err);
        }
    }

    getStripeCheckoutSession(sessionId: string, workspaceId: string, mgmtApiPrivateKey: string) {
        try {
            return axios.get(`${this.MANAGEMENT_BASE_API_URL}/billings/get-checkout-session/${workspaceId}/${sessionId}`, {
                params: {
                    API_KEY: mgmtApiPrivateKey
                },
                
            });
        } catch (err) {
            throw (err);
        }
    }

    /**
     * This function is responsible for getting the current billing status
     * @param workspaceId
     */
    getBillingStatus(workspaceId: string, mgmtApiPrivateKey: string) {
        try {
            // Add this this if/else to use octonius in local without running mgmt portal
            // mgmt would be needed for some functionalities, but basic work can be done
            if (process.env.NODE_ENV == 'development') {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            message: 'You have a in a DEVELOPMENT environment',
                            status: true,
                            onPremise: false
                        }
                    });
                  });
            } else {
                return axios.get(this.MANAGEMENT_BASE_API_URL + `/billings/get-billing-status/${workspaceId}`, {
                    params: {
                        API_KEY: mgmtApiPrivateKey
                    },
                    
                });
            }
        } catch (err) {
            throw (err);
        }
    }

    /**
     * This function is responsible for know if the workspace can access the billing page
     * Normally knowing if the environment is on-premise or on the cloud
     * @param workspaceId
     */
    canActivateBilling(workspaceId: string, mgmtApiPrivateKey: string) {
        try {
            return axios.get(this.MANAGEMENT_BASE_API_URL + `/billings/can-activate-billing/${workspaceId}`, {
                params: {
                    API_KEY: mgmtApiPrivateKey
                },
                
            });
        } catch (err) {
            throw (err);
        }
    }

    /**
     * This function fetches the subscription details for the currently loggedIn user
     */
    getSubscription(workspaceId: string, mgmtApiPrivateKey: string) {
        try {
            return axios.get(this.MANAGEMENT_BASE_API_URL + `/billings/get-subscription/${workspaceId}`, {
                params: {
                    API_KEY: mgmtApiPrivateKey
                },
                
            });
        } catch (err) {
            throw (err);
        }   
    }

    /**
     * This function fetches the stripe customer details for the currently loggedIn user
     */
    getStripeCustomer(customerId: string, mgmtApiPrivateKey: string) {
        try {
            return axios.get(this.MANAGEMENT_BASE_API_URL + `/billings/get-customer/${customerId}`, {
                params: {
                    API_KEY: mgmtApiPrivateKey
                },
                
            });
        } catch (err) {
            throw (err);
        }
    }

    /**
     * This function fetches the prices for the subscription for the currently loggedIn user
     */
    getSubscriptionPrices(mgmtApiPrivateKey: string) {
        try {
            return axios.get(this.MANAGEMENT_BASE_API_URL + `/billings/get-subscription-prices`, {
                params: {
                    API_KEY: mgmtApiPrivateKey
                },
                
            });
        } catch (err) {
            throw (err);
        }
    }

    isInTryOut(workspaceId: string, mgmtApiPrivateKey: string) {
        try {
            // Add this this if/else to use octonius in local without running mgmt portal
            // mgmt would be needed for some functionalities, but basic work can be done
            if (process.env.NODE_ENV == 'development') {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            message: 'succesfully retrieved the subscription',
                            status: false,
                            time_remaining: 100
                        }
                    });
                });
            } else {
                return axios.get(`${this.MANAGEMENT_BASE_API_URL}/billings/${workspaceId}/inTryOut`, {
                    params: {
                        API_KEY: mgmtApiPrivateKey
                    },
                    
                });
            }
        } catch (err) {
            throw (err);
        }
    }

    /* | ======================================= BILLING ENDS ========================================== | */

    /**
     * This function is responsible for check if the workspace has flamingo active
     * @param workspaceId
     */
    getFlamingoStatus(workspaceId: string, mgmtApiPrivateKey: string) {
        try {
            if (process.env.NODE_ENV == 'development') {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            message: 'Flamingo availability is true',
                            status: true
                        }
                    });
                });
            } else {
                return axios.get(`${this.MANAGEMENT_BASE_API_URL}/workspace/${workspaceId}/flamingo`, {
                    params: {
                        API_KEY: mgmtApiPrivateKey
                    },
                    
                });
            }
        } catch (err) {
            throw (err);
        }
    }

    /**
     * This function is responsible for check if the workspace has idea active
     * @param workspaceId
     */
    getIdeaStatus(workspaceId: string, mgmtApiPrivateKey: string) {
        try {
            if (process.env.NODE_ENV == 'development') {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            message: 'Idea availability is true',
                            status: true
                        }
                    });
                });
            } else {
                return axios.get(`${this.MANAGEMENT_BASE_API_URL}/workspace/${workspaceId}/idea`, {
                    params: {
                        API_KEY: mgmtApiPrivateKey
                    },
                    
                });
            }
        } catch (err) {
            throw (err);
        }
    }

    /**
     * This function is responsible for check if the workspace has excel import active
     * @param workspaceId
     */
    getExcelImportStatus(workspaceId: string, mgmtApiPrivateKey: string) {
        try {
            if (process.env.NODE_ENV == 'development') {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            message: 'Excel Import module availability is true',
                            status: true
                        }
                    });
                });
            } else {
                return axios.get(`${this.MANAGEMENT_BASE_API_URL}/workspace/${workspaceId}/excelImport`, {
                    params: {
                        API_KEY: mgmtApiPrivateKey
                    }
                });
            }
        } catch (err) {
            throw (err);
        }
    }

    /**
     * This function is responsible for check if the workspace has shuttel tasks module active
     * @param workspaceId
     */
     isShuttleTasksModuleAvailable(workspaceId: string, mgmtApiPrivateKey: string) {
        try {
            if (process.env.NODE_ENV == 'development') {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            message: 'Shuttle Tasks module availability is true',
                            status: true
                        }
                    });
                });
            } else {
                return axios.get(`${this.MANAGEMENT_BASE_API_URL}/workspace/${workspaceId}/shuttle`, {
                    params: {
                        API_KEY: mgmtApiPrivateKey
                    }
                });
            }
        } catch (err) {
            throw (err);
        }
    }

    /**
     * This function is responsible for check if the workspace has files versions module active
     * @param workspaceId
     */
     isFilesVersionsModuleAvailable(workspaceId: string, mgmtApiPrivateKey: string) {
        try {
            if (process.env.NODE_ENV == 'development') {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            message: 'Files Versions module availability is true',
                            status: true
                        }
                    });
                });
            } else {
                return axios.get(`${this.MANAGEMENT_BASE_API_URL}/workspace/${workspaceId}/filesVersions`, {
                    params: {
                        API_KEY: mgmtApiPrivateKey
                    }
                });
            }
        } catch (err) {
            throw (err);
        }
    }

    /**
     * This function is responsible for check if the workspace has organization module active
     * @param workspaceId
     */
     isOrganizationModuleAvailable(workspaceId: string, mgmtApiPrivateKey: string) {
        try {
            if (process.env.NODE_ENV == 'development') {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            message: 'Organization module availability is true',
                            status: true
                        }
                    });
                });
            } else {
                return axios.get(`${this.MANAGEMENT_BASE_API_URL}/workspace/${workspaceId}/organization`, {
                    params: {
                        API_KEY: mgmtApiPrivateKey
                    }
                });
            }
        } catch (err) {
            throw (err);
        }
    }

    /**
     * This function is responsible for check if the workspace has organization module active
     * @param workspaceId
     */
     getWorkspaceBaseURL(workspaceId: string, mgmtApiPrivateKey: string) {
        try {
            if (process.env.NODE_ENV == 'development') {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            message: 'Organization module availability is true',
                            status: true
                        }
                    });
                });
            } else {
                return axios.get(`${this.MANAGEMENT_BASE_API_URL}/workspace/${workspaceId}/baseURL`, {
                    params: {
                        API_KEY: mgmtApiPrivateKey
                    }
                });
            }
        } catch (err) {
            throw (err);
        }
    }
}