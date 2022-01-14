import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import moment from 'moment/moment';

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {

  constructor(private _http: HttpClient) { }

  baseUrl = environment.APPROVAL_BASE_API_URL;

  /**
   * This function is responsible to activate the approval option in the item
   * @param itemId
   * @param approval
   * @param type
   */
  activateApprovalForItem(itemId: string, approval: boolean, type: string) {
    const data = {
      type: type,
      approval: approval
    }
    return this._http.put(this.baseUrl + `/${itemId}/activateApprovalForItem`, data).toPromise();
  }

  /**
   * This function is responsible to adding an user from the approval flow of the item
   * @param itemId
   * @param type
   */
  addUserToFlow(itemId: string, type: string, userId: string) {
    const data = {
      type: type,
      userId: userId
    }
    return this._http.put(this.baseUrl + `/${itemId}/addUserToFlow`, data).toPromise();
  }

  /**
   * This function is responsible to removing an user from the approval flow of the item
   * @param itemId
   * @param type
   */
  removeUserFromFlow(itemId: string, type: string, approvalId: string) {
    const data = {
      type: type,
      approvalId: approvalId
    }
    return this._http.put(this.baseUrl + `/${itemId}/removeUserFromFlow`, data).toPromise();
  }

  /**
   * This function is responsible to saving the due date of the approval flow of the item
   * @param itemId
   * @param type
   */
   saveDueDate(itemId: string, type: string, dueDate: any) {
    const data = {
      type: type,
      dueDate: dueDate
    }

    return this._http.put(this.baseUrl + `/${itemId}/saveDueDate`, data).toPromise();
  }

  /**
   * This function is responsible to launch the approval flow of the item
   * @param itemId
   * @param type
   */
  launchApprovalFlow(itemId: string, type: string, approval_flow_launched: boolean) {
    const data = {
      type: type,
      approval_flow_launched: approval_flow_launched
    }
    return this._http.put(this.baseUrl + `/${itemId}/launchApprovalFlow`, data).toPromise();
  }

  approveItem(itemId: string, type: string, approvalId: string) {
    const data = {
      type: type,
      approvalId: approvalId
    }
    return this._http.put(this.baseUrl + `/${itemId}/approveItem`, data).toPromise();
  }

  rejectItem(itemId: string, type: string, approvalId: string, description: string) {
    const data = {
      type: type,
      description: description,
      approvalId: approvalId
    }
    return this._http.put(this.baseUrl + `/${itemId}/rejectItem`, data).toPromise();
  }


  confirmAction(itemId: string, type: string, approvalId: string, code: string, description: string) {
    const data = {
      type: type,
      code: code,
      approvalId: approvalId,
      description: description
    }
    return this._http.put(this.baseUrl + `/${itemId}/confirmAction`, data).toPromise();
  }
}
