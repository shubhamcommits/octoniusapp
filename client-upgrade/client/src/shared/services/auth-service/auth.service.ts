import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../storage-service/storage.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private BASE_API_URL = environment.BASE_API_URL;
  private storageService: StorageService;

  constructor(private httpClient: HttpClient) {
  }

  /**
   * This function is responsible for requesting the Login API from the server
   * @param userData - needs to be passed as the functional parameter with the following @properties to be used in the request body
   * @name email
   * @name workspace_name
   * @name password
   * @param user : { email: string, workspace_name: string, password: string }
   */
  signIn(userData: Object) {
    return this.httpClient.post(this.BASE_API_URL + '/auths/sign-in', userData);
  }

  /**
   * This function is responsible for requesting the Signup API from the server
   * @param userData - needs to be passed as the functional parameter with the following @properties to be used in the request body
   * @name first_name
   * @name last_name
   * @name email
   * @name workspace_name
   * @name password
   * @param user : { first_name: string, last_name:string, email: string, workspace_name: string, password: string }
   */
  signUp(userData: Object) {
    return this.httpClient.post(this.BASE_API_URL + '/auths/sign-up', userData);
  }

  /**
   * This function is responsible for requesting the Signout API from the server
   * And clears the session and local storage from the client side
   */
  signout() {
    return this.httpClient.get(this.BASE_API_URL + '/auths/sign-out')
  }
  
  /**
   * This function is responsible for requesting the check subscription validity API from the server
   * @param userId - needs to be passed as the functional parameter to be used in the request params
   */
  checkSubscriptionValidity(userId: string) {
    return this.httpClient.get(this.BASE_API_URL + `/auth/checkSubscriptionValidity/${userId}`);
  }

  /**
   * This function is responsible for requesting the check workspace name availability API from the server
   * @param workspaceData - needs to be passed as the functional parameter with the following @properties to be used in the request body
   * @name workspace_name
   * @param workspaceData : { workspace_name: string }
   */
  checkWorkspaceName(workspaceData: Object) {
    return this.httpClient.post(this.BASE_API_URL + '/auth/checkWorkspaceName', workspaceData).toPromise();
  }

  /**
   * This function is responsible for requesting the create new workspace API from the server
   * @param workspaceData - needs to be passed as the functional parameter with the following @properties to be used in the request body
   * @name owner_first_name
   * @name owner_last_name
   * @name owner_email
   * @name company_name
   * @name workspace_name
   * @name owner_password
   * @param workspaceData : { owner_first_name: string, owner_last_name: string, owner_email: string, company_name: string, workspace_name: string, owner_password: string }
   */
  createNewWorkspace(workspaceData: Object) {
    return this.httpClient.post(this.BASE_API_URL + '/auth/createNewWorkspace', workspaceData).toPromise();
  }

  /**
   * This function is responsible for requesting the check user availability API from the server
   * @param userData - needs to be passed as the functional parameter with the following @properties to be used in the request body
   * @name email
   * @name workspace_name
   * @param userData : { email: string, workspace_name: string }
   */
  checkUserAvailability(userData: Object) {
    return this.httpClient.post(this.BASE_API_URL + '/auths/checkUserAvailability', userData);
  }

  /**
   * This function is responsible to request the reset password details API from the server
   * @param userId - userId of the current user needs to be passed as the functional parameter to be used in the request params 
   */
  getResetPwdDetails(userId: string) {
    return this.httpClient.get(this.BASE_API_URL + `/auth/resetPasswordDetails/${userId}`);
  }

  /**
   * This function is responsible for requesting the reset password API from the server
   * @param resetPasswordData - needs to be passed as the functional parameter with the following @properties to be used in the request body
   * @name resetPwdId
   * @name password
   * @param resetPasswordData : { resetPwdId: string, password: string }
   */
  resetPassword(resetPasswordData: Object) {
    return this.httpClient.put(this.BASE_API_URL + `/auth/resetPassword`, resetPasswordData);
  }

  /**
   * This function is responsible for requesting the send reset password mail API from the server
   * @param mailData - needs to be passed as the functional parameter with the following @properties to be used in the request body
   * @name workspace
   * @name email
   * @param mailData : { workspace: string, email: string }
   */
   sendResetPasswordMail(mailData: Object) {
    return this.httpClient.post(this.BASE_API_URL + '/auth/sendResetPasswordMail', mailData);
  }

}
