import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CRMService {

  constructor(
    private _http: HttpClient) { }

  baseURL = environment.WORKSPACE_BASE_API_URL + '/crm';

  /**
   * This function is responsible for fetching all the crm information
   */
  getCRMInformation() {
    return this._http.get(this.baseURL + `/crm_info`).toPromise();
  }

  /**
   * This function is responsible for fetching all the crm contacts
   */
  getCRMContacts() {
    return this.getCRMContactsObservale().toPromise();
  }

  getCRMContactsObservale() {
    return this._http.get(this.baseURL + `/contacts`);
  }

  /**
   * This function is responsible for searching for companies in a workspace
   */
  searchCRMContacts(companyId: string, companySearchText: string) {
    return this._http.get(this.baseURL + `/searchContacts/${companyId}`, { params: {companySearchText} }).toPromise();
  }

  /**
   * This function is responsible for fetching a crm contact
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
   */
  createCRMContact(contactData: any){
    return this._http.post(this.baseURL + `/createContact`, { contactData }).toPromise()
  }

  /**
   * This function is responsible for fetching a crm company
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
   * This function is responsible for fetching all companies in a workspace
   */
  getCRMCompanies() {
    return this._http.get(this.baseURL + `/companies`).toPromise();
  }

  /**
   * This function is responsible for searching for companies in a workspace
   */
  searchCRMCompanies(companySearchText: string) {
    return this._http.get(this.baseURL + `/searchCompanies`, { params: {companySearchText} }).toPromise();
  }

  /**
   * This function is responsible for updating the crm company details
   * @param companyData
   */
  updateCRMCompany(companyData: any, fileToUpload: File) {
    let formData = new FormData();
    formData.append('companyImage', fileToUpload);
    return this._http.put(this.baseURL + `/${companyData._id}/updateCompany`, { formData, companyData }).toPromise()
  }

  /**
   * This function is responsible for creating a crm company
   */
  createCRMCompany(companyData: any) {
    return this._http.post(this.baseURL + `/createCompany`, { companyData }).toPromise();
  }

  /**
   * This function is responsible for fetching a crm product
   * @param productId
   */
  getCRMProduct(productId: string) {
    return this._http.get(this.baseURL + `/${productId}/product`).toPromise();
  }

  /**
   * This function is responsible for deleting a crm contact
   * @param productId
   */
  removeCRMProduct(productId: string){
    return this._http.delete(this.baseURL + `/${productId}/product`).toPromise()
  }

  /**
   * This function is responsible for fetching all companies in a workspace
   */
  getCRMProducts() {
    return this._http.get(this.baseURL + `/products`).toPromise();
  }

  /**
   * This function is responsible for searching for Products in a workspace
   */
  searchCRMProducts(productSearchText: string) {
    return this._http.get(this.baseURL + `/searchProducts`, { params: {productSearchText} }).toPromise();
  }

  /**
   * This function is responsible for updating the crm Product details
   * @param productData
   */
  updateCRMProduct(productData: any, ) {
    return this._http.put(this.baseURL + `/${productData._id}/updateProduct`, { productData }).toPromise()
  }

  /**
   * This function is responsible for creating a crm product
   */
  createCRMProduct(productData: any) {
    return this._http.post(this.baseURL + `/createProduct`, { productData }).toPromise();
  }

  saveNewCRMCustomField(newCustomField: { name: string; title: string; values: any[]; }) {
    return this._http.put(this.baseURL + `/crmCustomFields`, { newCustomField }).toPromise();
  }

  getCRMCustomFields() {
    return this._http.get(this.baseURL + `/crmCustomFields`).toPromise();
  }

  removeCRMCustomField(fieldId: string, ) {
    return this._http.delete(this.baseURL + `/crmCustomFields/${fieldId}`).toPromise();
  }

  addCRMCustomFieldNewValue(value: string, fieldId: string, ) {
    return this._http.put(this.baseURL + `/crmCustomFields/addValue`, { fieldId, value }).toPromise();
  }

  setCRMCustomFieldType(type: string, fieldId: string, ) {
    return this._http.put(this.baseURL + `/crmCustomFields/setCRMCustomFieldType`, { fieldId, type }).toPromise();
  }

  setCRMCustomFieldColor(color: string, fieldId: string, ) {
    return this._http.put(this.baseURL + `/crmCustomFields/color`, { fieldId, color }).toPromise();
  }

  removeCRMCustomFieldValue(value: string, fieldId: string, ) {
    return this._http.put(this.baseURL + `/crmCustomFields/removeValue`, { fieldId, value }).toPromise();
  }

  saveCRMCustomFieldsToShow(crmCustomFieldsToShow: any[]) {
    const customFieldsData = {
      crmCustomFieldsToShow: crmCustomFieldsToShow
    };

    return this._http.put(this.baseURL + `/crmCustomFieldsToShow`, customFieldsData).toPromise();
  }
}
