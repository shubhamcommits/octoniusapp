import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { UtilityService } from '../utility-service/utility.service';

@Injectable({
  providedIn: 'root'
})
export class CRMGroupService {

  constructor(
    private _http: HttpClient,
    private utilityService: UtilityService) { }

  baseURL = environment.GROUPS_BASE_API_URL + '/crm';

  /**
   * This function is responsible for fetching all the group crm contacts
   * @param groupId
   */
  getGroupCRMContacts(groupId: string) {
    return this.getGroupCRMContactsObservale(groupId).toPromise();
  }

  getGroupCRMContactsObservale(groupId: string) {
    return this._http.get(this.baseURL + `/${groupId}/contacts`);
  }

  /**
   * This function is responsible for searching for companies in a group
   * @param groupId
   */
  searchCRMContacts(groupId: string, companyId: string, companySearchText: string) {
    return this._http.get(this.baseURL + `/${groupId}/searchContacts/${companyId}`, { params: {companySearchText} }).toPromise();
  }

  /**
   * This function is responsible for fetching a group crm contact
   * @param contactId
   */
  getCRMContact(contactId: string) {
    return this._http.get(this.baseURL + `/${contactId}/contact`).toPromise();
  }

  /**
   * This function is responsible for deleting a crm contact
   * @param contactId
   */
  removeCRMContact(contactId: string){
    return this._http.delete(this.baseURL + `/${contactId}/contact`).toPromise()
  }

  /**
   * This function is responsible for updating the crm contact details
   * @param contactData
   */
  updateCRMContact(contactData: any){
    return this._http.put(this.baseURL + `/${contactData._id}/updateContact`, { contactData }).toPromise()
  }

  /**
   * This function is responsible for creating a crm contact
   * @param groupId
   */
  createCRMContact(contactData: any){
    return this._http.post(this.baseURL + `/createContact`, { contactData }).toPromise()
  }

  /**
   * This function is responsible for fetching a group crm company
   * @param companyId
   */
  getCRMCompany(companyId: string) {
    return this._http.get(this.baseURL + `/${companyId}/company`).toPromise();
  }

  /**
   * This function is responsible for deleting a crm contact
   * @param companyId
   */
  removeCRMCompany(companyId: string){
    return this._http.delete(this.baseURL + `/${companyId}/company`).toPromise()
  }

  /**
   * This function is responsible for fetching all companies in a group
   * @param groupId
   */
  getCRMCompanies(groupId: string) {
    return this._http.get(this.baseURL + `/${groupId}/companies`).toPromise();
  }

  /**
   * This function is responsible for searching for companies in a group
   * @param groupId
   */
  searchCRMCompanies(groupId: string, companySearchText: string) {
    return this._http.get(this.baseURL + `/${groupId}/searchCompanies`, { params: {companySearchText} }).toPromise();
  }

  /**
   * This function is responsible for updating the crm company details
   * @param companyData
   */
  updateCRMCompany(companyData: any) {
    return this._http.put(this.baseURL + `/${companyData._id}/updateCompany`, { companyData }).toPromise()
  }

  /**
   * This function is responsible for creating a crm company
   * @param groupId
   */
  createCRMCompany(companyData: any) {
    return this._http.post(this.baseURL + `/createCompany`, { companyData }).toPromise();
  }

  saveNewCRMCustomField(newCustomField: { name: string; title: string; values: any[]; }, groupId: any) {
    return this._http.put(this.baseURL + `/${groupId}/crmCustomFields`, { newCustomField }).toPromise();
  }

  getCRMGroupCustomFields(groupId: string) {
    return this._http.get(this.baseURL + `/${groupId}/crmCustomFields`).toPromise();
  }

  removeCRMCustomField(fieldId: string, groupId: string) {
    return this._http.delete(this.baseURL + `/${groupId}/crmCustomFields/${fieldId}`).toPromise();
  }

  addCRMCustomFieldNewValue(value: string, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/crmCustomFields/addValue`, { fieldId, value }).toPromise();
  }

  setCRMCustomFieldDisplayKanbanCard(display_in_kanban_card: boolean, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/crmCustomFields/displayInKanbanCard`, { fieldId, display_in_kanban_card }).toPromise();
  }

  setCRMCustomFieldType(company_type: boolean, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/crmCustomFields/setCRMCustomFieldType`, { fieldId, company_type }).toPromise();
  }

  setCRMCustomFieldColor(color: string, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/crmCustomFields/color`, { fieldId, color }).toPromise();
  }

  removeCRMCustomFieldValue(value: string, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/crmCustomFields/removeValue`, { fieldId, value }).toPromise();
  }

  saveCRMCustomFieldsToShow(groupId: string, crmCustomFieldsToShow: any[]) {
    const customFieldsData = {
      crmCustomFieldsToShow: crmCustomFieldsToShow
    };

    return this._http.put(this.baseURL + `/${groupId}/crmCustomFieldsToShow`, customFieldsData).toPromise();
  }
}
