import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CRMGroupService {

  constructor(
    private _http: HttpClient) { }

  baseURL = environment.GROUPS_BASE_API_URL + '/crm';

  /**
   * This function is responsible for updating the crm order details
   * @param contactData
   */
  updateCRMOrder(postId: string, orderData: any){
    return this._http.put(this.baseURL + `/${postId}/crmOrder`, { orderData }).toPromise()
  }

  /**
   * This function is responsible for creating a crm order
   * @param groupId
   */
  createCRMOrder(postId: string, orderData: any){
    return this._http.post(this.baseURL + `/${postId}/crmOrder`, { orderData }).toPromise()
  }

  removeCRMOrder(postId: string, orderId: string) {
    return this._http.delete(this.baseURL + `/${postId}/crmOrder/${orderId}`).toPromise();
  }
}
