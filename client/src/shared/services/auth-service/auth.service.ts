import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private AUTH_BASE_API_URL = environment.AUTH_BASE_API_URL;
  private WORKSPACE_BASE_API_URL = environment.WORKSPACE_BASE_API_URL;

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
    return this.httpClient.post(this.AUTH_BASE_API_URL + '/sign-in', userData);
  }

  /**
   * This function is responsible for completing the login process by selecting a workspace
   *
   * @param accountId
   * @param workspaceId
   */
  selectWorkspace(accountId: string, workspaceId: string) {
    return this.httpClient.post(this.AUTH_BASE_API_URL + '/select-workspace', {
      accountId: accountId,
      workspaceId: workspaceId
    });
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
    return this.httpClient.post(this.AUTH_BASE_API_URL + '/sign-up', { userData: userData });
  }

  /**
   * This function is responsible for requesting the Signout API from the server
   * And clears the session and local storage from the client side
   */
  signout() {
    return this.httpClient.post(this.AUTH_BASE_API_URL + '/sign-out', '')
  }

  /**
   * This function is responsible for requesting the check workspace name availability API from the server
   * @param workspaceData - needs to be passed as the functional parameter with the following @properties to be used in the request body
   * @name workspace_name
   * @param workspaceData : { workspace_name: string }
   */
  checkWorkspaceName(workspaceData: any) {
    return this.httpClient.get(this.WORKSPACE_BASE_API_URL + '/check-availability', {
      params: {
        workspace_name: workspaceData.workspace_name
      }
    }).toPromise();
  }

  /**
   * This function is responsible for requesting the create new workspace API from the server
   * @param workspaceData
   * @param accountData
   */
  createNewWorkspace(workspaceData: Object, accountData: Object) {
    return this.httpClient.post(this.WORKSPACE_BASE_API_URL + '/', {
      newWorkspace: workspaceData,
      accountData: accountData
    }).toPromise();
  }

  /**
   * This function is responsible for requesting the join user to a workspace API from the server
   * @param workspaceData
   * @param accountData
   */
  joinWorkspace(workspaceData: Object, accountData: Object) {
    return this.httpClient.post(this.AUTH_BASE_API_URL + '/join-workspace', {
      workspace: workspaceData,
      accountData: accountData
    }).toPromise();
  }

  /**
   * This function is responsible for requesting the reset password API from the server
   * @param resetPasswordData - needs to be passed as the functional parameter with the following @properties to be used in the request body
   * @name resetPwdId
   * @name password
   * @param resetPasswordData : { resetPwdId: string, password: string }
   */
  resetPassword(resetPasswordData: Object) {
    return this.httpClient.put(this.AUTH_BASE_API_URL + `/passwords/reset`, resetPasswordData).toPromise()
  }

  /**
   * This function is responsible for requesting the send reset password mail API from the server
   * @param mailData - needs to be passed as the functional parameter with the following @properties to be used in the request body
   * @name workspace
   * @name email
   * @param mailData : { workspace_name: string, email: string }
   */
  sendResetPasswordMail(mailData: Object) {
    return this.httpClient.post(this.AUTH_BASE_API_URL + '/passwords/send-mail', mailData);
  }

  getUserByEmail(email: string) {
    // Call the API
    return this.httpClient.get(this.AUTH_BASE_API_URL + '/email-exists', { params: { email: email } }).toPromise();
  }

  getNumberUsersByEmailAndPassword(email: string, password: string) {
    return this.httpClient.get(this.AUTH_BASE_API_URL + '/num-user-by-email-pwd', { params: { email: email, password: password } }).toPromise();
  }

  getUserWorkspaces(email: string, password: string) {
    return this.httpClient.get(this.AUTH_BASE_API_URL + '/user-workspaces', { params: { email: email, password: password } }).toPromise();
  }
}
