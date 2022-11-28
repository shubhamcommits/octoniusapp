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

  getEntityPayrollVariablesAndCustomFields(userId: string) {
    return this._http.get(this.baseUrl + `/${userId}/entityVariablesCF`).toPromise();
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

  getMembersOff(workspaceId: string) {
    return this._http.get(this.baseUrl + `/${workspaceId}/membersOff`).toPromise();
  }
}
