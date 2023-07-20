import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SubSink } from 'subsink';
import { BehaviorSubject } from 'rxjs';
import { UtilityService } from '../utility-service/utility.service';
import { StorageService } from '../storage-service/storage.service';
import { retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ManagementPortalService {

  MANAGEMENT_BASE_API_URL = environment.MANAGEMENT_URL + '/api';
  WORKSPACE_BASE_API_URL = environment.WORKSPACE_BASE_API_URL;

  /**
  * Both of the variables listed down below are used to share the data through this common service among different components in the app
  * @constant stripeSubscriptionSource
  * @constant stripeSubscriptionData
  */
  private stripeSubscriptionSource = new BehaviorSubject<any>({});
  stripeSubscriptionData = this.stripeSubscriptionSource.asObservable();

  private subSink = new SubSink();

  constructor(
    private _http: HttpClient,
    private injector: Injector) { }

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
    });
  }

  /**
   * This function fetches the subscription details for the currently loggedIn user
   */
  getSubscriptionObservable() {
    return this._http.get(this.WORKSPACE_BASE_API_URL + `/billing/get-subscription`, {});
  }

  /**
   * This function fetches the subscription details for the currently loggedIn user
   */
  getSubscription() {
    return this.getSubscriptionObservable().toPromise();
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
  // getSubscriptionPrices(mgmtApiPrivateKey: string) {
  //   return this._http.get(this.WORKSPACE_BASE_API_URL + `/billing/get-subscription-prices`, {
  //     params: {
  //       mgmtApiPrivateKey: mgmtApiPrivateKey
  //     }
  //   })
  //     .toPromise()
  // }

  isInTryOut(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/${workspaceId}/inTryOut`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    }).toPromise();
  }

  /**
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param stripeSubscription
   */
  public updateStripeSubscriptionData(stripeSubscription: any){
    this.stripeSubscriptionSource.next(stripeSubscription);
  }

  public async getStripeSubscription() {
      let subscriptionData: any = await this.getStripeSubscriptionFromService();
      const utilityService = this.injector.get(UtilityService);

      if (!utilityService.objectExists(subscriptionData)) {
          subscriptionData = await this.getStripeSubscriptionFromStorage();
      }

      if (!utilityService.objectExists(subscriptionData)) {
        subscriptionData = await this.getStripeSubscriptionFromHTTP().catch(err => {
          subscriptionData = {};
        });
      }

      this.sendUpdatesToStripeSubscription(subscriptionData);

      return subscriptionData || {};
  }

  async getStripeSubscriptionFromService() {
    return new Promise((resolve) => {
      const utilityService = this.injector.get(UtilityService);
      this.subSink.add(this.stripeSubscriptionData.subscribe((res) => {
        resolve(res)
      }));
    })
  }

  async getStripeSubscriptionFromStorage() {
    const storageService = this.injector.get(StorageService);
    return (storageService.existData('stripeSubscription') === null) ? {} : storageService.getLocalData('stripeSubscription');
  }

  async getStripeSubscriptionFromHTTP() {
    return new Promise((resolve, reject) => {
      this.subSink.add(this.getSubscriptionObservable()
          .pipe(retry(1))
          .subscribe(
            (res) => {
              let subscription = res['subscription'];
              if (!subscription) {
                subscription = {};
              }
              if (!subscription.product) {
                subscription.product = res['product'];
              }
              resolve(subscription);
            }, (err) => reject(err))
      );
    });
  }

  async sendUpdatesToStripeSubscription(stripeSubscription: Object) {
    const storageService = this.injector.get(StorageService);
    this.updateStripeSubscriptionData(stripeSubscription);
    storageService.setLocalData('stripeSubscription', JSON.stringify(stripeSubscription))
  }

  async checkIsIndividualSubscription() {
    const subscription = await this.getStripeSubscription();
    const utilityService = this.injector.get(UtilityService);
console.log(subscription);
console.log(utilityService.objectExists(subscription));
console.log(subscription.product);
console.log(subscription.product == environment.STRIPE_INDIVIDUAL_PRODUCT_ID);
    return (utilityService.objectExists(subscription) && subscription.product && subscription.product == environment.STRIPE_INDIVIDUAL_PRODUCT_ID);
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
   * This function is responsible for check if the workspace has shuttle module active
   * @param workspaceId
   */
  isShuttleTasksModuleAvailable(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/${workspaceId}/shuttle`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    }).toPromise();
  }

  /**
   * This function is responsible for check if the workspace has excel module active
   * @param workspaceId
   */
  isExcelModuleAvailable(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/${workspaceId}/excelImport`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    }).toPromise();
  }

  /**
   * This function is responsible for check if the workspace has files versions module active
   * @param workspaceId
   */
   isFilesVersionsModuleAvailable(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/${workspaceId}/filesVersions`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    }).toPromise();
  }

  /**
   * This function is responsible for check if the workspace has organization module active
   * @param workspaceId
   */
   isOrganizationModuleAvailable(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/${workspaceId}/organization`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    }).toPromise();
  }

  /**
   * This function is responsible for check if the workspace has chat module active
   * @param workspaceId
   */
   isChatModuleAvailable(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/${workspaceId}/chat`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    }).toPromise();
  }

  /**
   * This function is responsible for check if the workspace has chat module active
   * @param workspaceId
   */
   isLoungeModuleAvailable(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/${workspaceId}/lounge`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    }).toPromise();
  }

  /**
   * This function is responsible for check if the workspace has excel module active
   * @param workspaceId
   */
  getWorkspaceBaseURL(workspaceId: string, mgmtApiPrivateKey: string) {
    return this._http.get(`${this.WORKSPACE_BASE_API_URL}/${workspaceId}/baseURL`, {
      params: {
        mgmtApiPrivateKey: mgmtApiPrivateKey
      }
    });
  }
}
