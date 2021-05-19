import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { GroupService } from '../group-service/group.service';
import { GroupsService } from '../groups-service/groups.service';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})

export class ManagementPortalService {

  BASE_API_URL = environment.MANAGEMENT_URL + '/api';

  constructor(
    private _http: HttpClient,
    private injector: Injector,
    private groupsService: GroupsService,
    private groupService: GroupService) { }

  /* | ======================================= BILLING ========================================== | */

  createClientPortalSession(stripeCustomerId: string, returnUrl: string, mgmtApiPrivateKey: string) {
    return this._http.post(`${this.BASE_API_URL}/billings/create-client-portal-session`, {
      customer: stripeCustomerId,
      return_url: returnUrl,
      API_KEY: mgmtApiPrivateKey
    }).toPromise();
  }

  createStripeCheckoutSession(priceId: string, workspaceId: string, returnUrl: string, mgmtApiPrivateKey: string) {
    return this._http.post(`${this.BASE_API_URL}/billings/create-checkout-session`, {
      priceId: priceId,
      workspaceId: workspaceId,
      return_url: returnUrl,
      API_KEY: mgmtApiPrivateKey
    }).toPromise();
  }

  getStripeCheckoutSession(sessionId: string, workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.BASE_API_URL}/billings/get-checkout-session/${workspaceId}/${sessionId}`, {
        params: {
          API_KEY: mgmtApiPrivateKey
        }
      }).toPromise();
  }

  /**
   * This function is responsible for getting the current billing status
   * @param workspaceId
   */
  getBillingStatus(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(this.BASE_API_URL + `/billings/get-billing-status/${workspaceId}`, {
      params: {
        API_KEY: mgmtApiPrivateKey
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
    return this._http.get(this.BASE_API_URL + `/billings/can-activate-billing/${workspaceId}`, {
      params: {
        API_KEY: mgmtApiPrivateKey
      }
    })
    .toPromise()
  }

  /**
   * This function fetches the subscription details for the currently loggedIn user
   */
   getSubscription(subscriptionId: string) {
    return this._http.get(this.BASE_API_URL + `/billings/get-subscription/${subscriptionId}`)
    .toPromise()
  }

  /**
   * This function fetches the stripe customer details for the currently loggedIn user
   */
  getStripeCustomer(customerId: string) {
    return this._http.get(this.BASE_API_URL + `/billings/get-customer/${customerId}`)
    .toPromise()
  }

  /**
   * This function fetches the prices for the subscription for the currently loggedIn user
   */
  getSubscriptionPrices(productId: string) {
    return this._http.get(this.BASE_API_URL + `/billings/get-subscription-prices/${productId}`)
    .toPromise()
  }

  /* | ======================================= BILLING ENDS ========================================== | */

  /**
   * This function is responsible for check if the workspace has flamingo active
   * @param workspaceId
   */
  getFlamingoStatus(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.BASE_API_URL}/workspace/${workspaceId}/flamingo`, {
      params: {
        API_KEY: mgmtApiPrivateKey
      }
    }).toPromise();
  }

  /**
   * This function is responsible for check if the workspace has excel import active
   * @param workspaceId
   */
   getExcelImportStatus(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.BASE_API_URL}/workspace/${workspaceId}/excelImport`, {
      params: {
        API_KEY: mgmtApiPrivateKey
      }
    }).toPromise();
  }
}
