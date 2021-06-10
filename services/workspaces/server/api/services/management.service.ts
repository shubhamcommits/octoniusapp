import { CommonService } from '.';
import { Account, Group, User, Workspace } from '../models';
import http from "axios";
import { config } from '../../utils';

const commonService = new CommonService();

/*  ===============================
 *  -- Management Service --
 *  ===============================
 */
export class ManagementService {

    /* | ======================================= BILLING ========================================== | */

    createClientPortalSession(workspaceId: string, returnUrl: string, mgmtApiPrivateKey: string) {
        return http.post(`${process.env.MANAGEMENT_URL}/billings/create-client-portal-session`, {
        workspaceId: workspaceId,
        return_url: returnUrl,
        API_KEY: mgmtApiPrivateKey
        });
    }

    createStripeCheckoutSession(priceId: string, workspaceId: string, returnUrl: string, mgmtApiPrivateKey: string) {
        return http.post(`${process.env.MANAGEMENT_URL}/billings/create-checkout-session`, {
        priceId: priceId,
        workspaceId: workspaceId,
        return_url: returnUrl,
        API_KEY: mgmtApiPrivateKey
        });
    }

    getStripeCheckoutSession(sessionId: string, workspaceId: string, mgmtApiPrivateKey: string) {
        return http.get(`${process.env.MANAGEMENT_URL}/billings/get-checkout-session/${workspaceId}/${sessionId}`, {
            params: {
            API_KEY: mgmtApiPrivateKey
            }
        });
    }

    /**
     * This function is responsible for getting the current billing status
     * @param workspaceId
     */
    getBillingStatus(workspaceId: string, mgmtApiPrivateKey: string) {
        return http.get(process.env.MANAGEMENT_URL + `/billings/get-billing-status/${workspaceId}`, {
        params: {
            API_KEY: mgmtApiPrivateKey
        }
        })
        
    }

    /**
     * This function is responsible for know if the workspace can access the billing page
     * Normally knowing if the environment is on-premise or on the cloud
     * @param workspaceId
     */
    canActivateBilling(workspaceId: string, mgmtApiPrivateKey: string) {
        return http.get(process.env.MANAGEMENT_URL + `/billings/can-activate-billing/${workspaceId}`, {
        params: {
            API_KEY: mgmtApiPrivateKey
        }
        })
        
    }

    /**
     * This function fetches the subscription details for the currently loggedIn user
     */
    getSubscription(workspaceId: string, mgmtApiPrivateKey: string) {
        return http.get(process.env.MANAGEMENT_URL + `/billings/get-subscription/${workspaceId}`, {
        params: {
            API_KEY: mgmtApiPrivateKey
        }
        })
        
    }

    /**
     * This function fetches the stripe customer details for the currently loggedIn user
     */
    getStripeCustomer(customerId: string, mgmtApiPrivateKey: string) {
        return http.get(process.env.MANAGEMENT_URL + `/billings/get-customer/${customerId}`, {
        params: {
            API_KEY: mgmtApiPrivateKey
        }
        })
        
    }

    /**
     * This function fetches the prices for the subscription for the currently loggedIn user
     */
    getSubscriptionPrices(mgmtApiPrivateKey: string) {
        return http.get(process.env.MANAGEMENT_URL + `/billings/get-subscription-prices`, {
        params: {
            API_KEY: mgmtApiPrivateKey
        }
        })
        
    }

    isInTryOut(workspaceId: string, mgmtApiPrivateKey: string) {
        return http.get(`${process.env.MANAGEMENT_URL}/billings/${workspaceId}/inTryOut`, {
        params: {
            API_KEY: mgmtApiPrivateKey
        }
        });
    }

    /* | ======================================= BILLING ENDS ========================================== | */

    /**
     * This function is responsible for check if the workspace has flamingo active
     * @param workspaceId
     */
    getFlamingoStatus(workspaceId: string, mgmtApiPrivateKey: string) {
        return http.get(`${process.env.MANAGEMENT_URL}/workspace/${workspaceId}/flamingo`, {
        params: {
            API_KEY: mgmtApiPrivateKey
        }
        });
    }

    /**
     * This function is responsible for check if the workspace has excel import active
     * @param workspaceId
     */
    getExcelImportStatus(workspaceId: string, mgmtApiPrivateKey: string) {
        return http.get(`${process.env.MANAGEMENT_URL}/workspace/${workspaceId}/excelImport`, {
            params: {
                    API_KEY: mgmtApiPrivateKey
                }
            });
    }
}