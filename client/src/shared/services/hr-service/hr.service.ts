import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HRService {

  constructor(private _http: HttpClient) { }

  baseUrl = environment.WORKSPACE_BASE_API_URL + '/hr';

  getEntities(workspaceId: string) {
    return this._http.get(this.baseUrl + '/', { params: { workspaceId }}).toPromise();
  }

  getEntityDetails(entityId: string) {
    return this._http.get(this.baseUrl + `/${entityId}`).toPromise();
  }

  /**
   * This function is responsible for creating an entity
   */
  create(workspaceId: string, entityName: string) {
    // Call the HTTP Request
    return this._http.post(this.baseUrl + '/', { workspaceId, entityName }).toPromise();
  }

  saveEntityProperty(entityId: string, propertyToSave: any) {
    return this._http.post(this.baseUrl +  `/${entityId}`, { propertyToSave }).toPromise();
  }

  delete(entityId: string) {
    return this._http.delete(this.baseUrl + `/${entityId}`).toPromise();
  }

  createNewVariable(entityId: string, variable: any) {
    return this._http.post(this.baseUrl + `/${entityId}/variable`, { variable }).toPromise();
  }

  editEntityVariable(entityId: string, variable: any) {
    return this._http.post(this.baseUrl + `/${entityId}/edit-variable`, { variable }).toPromise();
  }

  deleteEntityVariable(entityId: string, variableId: string) {
    return this._http.post(this.baseUrl + `/${entityId}/delete-variable`, { variableId }).toPromise();
  }

  getEntityPayrollInfo(userId: string) {
    return this._http.get(this.baseUrl + `/${userId}/entityInfor`).toPromise();
  }

  createNewCF(entityId: string, cf: any) {
    return this._http.post(this.baseUrl + `/${entityId}/cf`, { cf }).toPromise();
  }

  editEntityCF(entityId: string, cf: any) {
    return this._http.post(this.baseUrl + `/${entityId}/edit-cf`, { cf }).toPromise();
  }

  deleteEntityCF(entityId: string, cfId: string) {
    return this._http.post(this.baseUrl + `/${entityId}/delete-cf`, { cfId }).toPromise();
  }

  createNewBenefit(entityId: string, benefit: any) {
    return this._http.post(this.baseUrl + `/${entityId}/benefit`, { benefit }).toPromise();
  }

  editEntityBenefit(entityId: string, benefit: any) {
    return this._http.post(this.baseUrl + `/${entityId}/edit-benefit`, { benefit }).toPromise();
  }

  deleteEntityBenefit(entityId: string, benefitId: string) {
    return this._http.post(this.baseUrl + `/${entityId}/delete-benefit`, { benefitId }).toPromise();
  }

  createNewDaysOff(entityId: string, daysOff: any) {
    return this._http.post(this.baseUrl + `/${entityId}/days-off`, { daysOff }).toPromise();
  }

  editEntityDaysOff(entityId: string, daysOff: any) {
    return this._http.post(this.baseUrl + `/${entityId}/edit-days-off`, { daysOff }).toPromise();
  }

  deleteEntityDaysOff(entityId: string, daysOffId: string) {
    return this._http.post(this.baseUrl + `/${entityId}/delete-days-off`, { daysOffId }).toPromise();
  }

  addBankHoliday(entityId: string, daysOffId: string, bankHoliday: any) {
    return this._http.post(this.baseUrl + `/${entityId}/add-bank-holidays`, { daysOffId, bankHoliday }).toPromise();
  }

  removeBankHoliday(entityId: string, daysOffId: string, bankHoliday: any) {
    return this._http.post(this.baseUrl + `/${entityId}/remove-bank-holidays`, { daysOffId, bankHoliday }).toPromise();
  }

  getEntityMembers(entityId: string) {
    return this._http.get(this.baseUrl + `/${entityId}/entityMembers`).toPromise();
  }

  removeMemberFromentity(entityId: string, memberId: string) {
    return this._http.post(this.baseUrl + `/${entityId}/removeMemberFromentity`, { memberId }).toPromise();
  }

  addMemberToEntity(entityId: string, memberId: string) {
    return this._http.post(this.baseUrl + `/${entityId}/addMemberToEntity`, { memberId }).toPromise();
  }

  addAllMemberToEntity(entityId: string, workspaceId: string) {
    return this._http.post(this.baseUrl + `/${entityId}/addAllMemberToEntity`, { workspaceId }).toPromise();
  }

  getTopMembersOff(workspaceId: string) {
    return this._http.get(this.baseUrl + `/${workspaceId}/topMembersOff`).toPromise();
  }

  getMembersOff(members: any, from: any, to: any, workspaceId?: string) {
    return this._http.get(this.baseUrl + `/${workspaceId}/membersOff`, {
      params: {
        from: from,
        to: to,
        members: members
      }
    }).toPromise();
  }

  getHRPendingNotifications(workspaceId: string) {
    return this._http.get(this.baseUrl + `/${workspaceId}/hr-pending-notifications`).toPromise();
  }

  getTopHRPendingNotifications(workspaceId: string) {
    return this._http.get(this.baseUrl + `/${workspaceId}/top-hr-pending-notifications`).toPromise();
  }

  markNotificationAsDone(workspaceId: string) {
    return this._http.post(this.baseUrl + `/${workspaceId}/mark-notification-as-done`, {}).toPromise();
  }
}
