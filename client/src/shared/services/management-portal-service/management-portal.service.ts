import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ManagementPortalService {

  MANAGEMENT_BASE_API_URL = environment.MANAGEMENT_URL + '/api';
  WORKSPACE_BASE_API_URL = environment.WORKSPACE_BASE_API_URL;

  constructor(
    private _http: HttpClient) { }

  /* | ======================================= BILLING ========================================== | */

  createClientPortalSession(workspaceId: string, return_url: string, mgmtApiPrivateKey: string) {
    return this._http.post(`${this.WORKSPACE_BASE_API_URL}/create-client-portal-session`, {
      workspaceId: workspaceId,
      return_url: return_url,
      mgmtApiPrivateKey: mgmtApiPrivateKey
    }).toPromise();
  }

  createStripeCheckoutSession(priceId: string, workspaceId: string, return_url: string, mgmtApiPrivateKey: string) {
    return this._http.post(`${this.WORKSPACE_BASE_API_URL}/create-checkout-session`, {
      priceId: priceId,
      workspaceId: workspaceId,
      return_url: return_url,
      mgmtApiPrivateKey: mgmtApiPrivateKey
    }).toPromise();
  }

  getStripeCheckoutSession(sessionId: string, workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/get-checkout-session/${workspaceId}/${sessionId}`, {
        params: {
          mgmtApiPrivateKey: mgmtApiPrivateKey
        }
      }).toPromise();
  }

  /**
   * This function is responsible for getting the current billing status
   * @param workspaceId
   */
  getBillingStatus(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(this.WORKSPACE_BASE_API_URL + `/get-billing-status/${workspaceId}`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    })
    .toPromise()
  }

  /**
   * This function is responsible for know if the workspace can access the billing page
   * Normally knowing if the environment is on-premise or on the cloud
   * @param workspaceId
   */
   canActivateBilling(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(this.WORKSPACE_BASE_API_URL + `/can-activate-billing/${workspaceId}`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    })
    .toPromise()
  }

  /**
   * This function fetches the subscription details for the currently loggedIn user
   */
   getSubscription(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(this.WORKSPACE_BASE_API_URL + `/get-subscription/${workspaceId}`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    })
    .toPromise()
  }

  /**
   * This function fetches the stripe customer details for the currently loggedIn user
   */
  getStripeCustomer(customerId: string, mgmtApiPrivateKey: string) {
    return this._http.get(this.WORKSPACE_BASE_API_URL + `/get-customer/${customerId}`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    })
    .toPromise()
  }

  /**
   * This function fetches the prices for the subscription for the currently loggedIn user
   */
  getSubscriptionPrices(mgmtApiPrivateKey: string) {
    return this._http.get(this.WORKSPACE_BASE_API_URL + `/billing/get-subscription-prices`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    })
    .toPromise()
  }

  isInTryOut(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/${workspaceId}/inTryOut`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    }).toPromise();
  }

  /* | ======================================= BILLING ENDS ========================================== | */

  /**
   * This function is responsible for check if the workspace has flamingo active
   * @param workspaceId
   */
  getFlamingoStatus(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/${workspaceId}/flamingo`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    }).toPromise();
  }

  /**
   * This function is responsible for check if the workspace has idea active
   * @param workspaceId
   */
  getIdeaStatus(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/${workspaceId}/idea`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    }).toPromise();
  }

  /**
   * This function is responsible for check if the workspace has excel import active
   * @param workspaceId
   */
   getExcelImportStatus(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/${workspaceId}/excelImport`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    }).toPromise();
  }
}
