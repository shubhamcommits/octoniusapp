import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from '../utility-service/utility.service';

@Injectable({
  providedIn: 'root'
})
export class ResourcesGroupService {

  constructor(
    private utilityService: UtilityService,
    private _http: HttpClient) { }

  baseURL = environment.GROUPS_BASE_API_URL + '/resources';

  createResource(newResource: any) {
    return this._http.post(this.baseURL + `/`, {
      newResource: newResource
    }).toPromise();
  }

  saveResouceProperty(resourceId: string, propertyData: any) {
    return this._http.put(this.baseURL + `/${resourceId}/updateProperty`,{propertyData}).toPromise();
  }

  getResourceDetails(resourceId: string) {
    return this._http.get(this.baseURL + `/${resourceId}`).toPromise();
  }

  removeResource(resourceId: string) {
    return this._http.delete(this.baseURL + `/${resourceId}`).toPromise();
  }

  saveNewResourcesCustomField(newCustomField: { name: string; title: string; values: any[]; }, groupId: any) {
    return this._http.put(this.baseURL + `/${groupId}/resourcesCustomFields`, { newCustomField }).toPromise();
  }

  getGroupResourcesCustomFields(groupId: string) {
    return this._http.get(this.baseURL + `/${groupId}/resourcesCustomFields`).toPromise();
  }

  removeResourcesCustomField(fieldId: string, groupId: string) {
    return this._http.delete(this.baseURL + `/${groupId}/resourcesCustomFields/${fieldId}`).toPromise();
  }

  addResourcesCustomFieldNewValue(value: string, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/resourcesCustomFields/addValue`, { fieldId, value }).toPromise();
  }

  // setResourcesCustomFieldDisplayKanbanCard(display_in_kanban_card: boolean, fieldId: string, groupId: string) {
  //   return this._http.put(this.baseURL + `/${groupId}/resourcesCustomFields/displayInKanbanCard`, { fieldId, display_in_kanban_card }).toPromise();
  // }

  setResourcesCustomFieldColor(color: string, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/resourcesCustomFields/color`, { fieldId, color }).toPromise();
  }

  removeResourcesCustomFieldValue(value: string, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/resourcesCustomFields/removeValue`, { fieldId, value }).toPromise();
  }

  /**
   * This function is used to save a custom field value
   * @param resourceId
   */
  saveCustomField(resourceId: string, customFieldName: string, customFieldValue: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${resourceId}/customField`, {
      customFieldName: customFieldName,
      customFieldValue: customFieldValue
    }).toPromise();
  }

  getGroupResources(groupId: string) {
    return this._http.get(this.baseURL + `/${groupId}/all`).toPromise();
  }

  saveCustomFieldsToShow(groupId: string, customFieldsToShow: any[]) {
    return this._http.put(this.baseURL + `/${groupId}/customFieldsToShow`, { customFieldsToShow }).toPromise();
  }

  saveActivityEntry(resourceId: string, newActivity: any) {
    return this._http.put(this.baseURL + `/${resourceId}/activityEntry`, { newActivity }).toPromise();
  }

  editActivityEntry(resourceId: string, editedEntity: any, propertyEdited: string) {
    return this._http.post(this.baseURL + `/${resourceId}/activityEntry/${editedEntity._id}`, { editedEntity, propertyEdited }).toPromise();
  }

  removeActivityEntity(resourceId: string, activityEntityId: string) {
    return this._http.delete(this.baseURL + `/${resourceId}/removeActivityEntry/${activityEntityId}`).toPromise();
  }

  async exportInventoryToFile(exportType: string, sections: any, name: string) {
    if (exportType == 'excel') {
      this.utilityService.saveAsExcelFile(sections, name);
    }
  }
}