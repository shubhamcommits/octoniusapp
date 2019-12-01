import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class AdminService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  /**
   * This function is responsible for adding the domain to list of domains from which sign-up to a particular workspace is allowed
   * @param workspaceId 
   * @param domain 
   */
  addToAllowedDomain(workspaceId: string, domain: string) {
    
    let domainData: { domain: string } = {
      domain: domain.trim()
    }

    return this._http.post(this.BASE_API_URL + `/workspaces/${workspaceId}/domains`, domainData);
  }

  /**
   * 
   * @param workspaceId 
   * @param domain 
   */
  removeDomain(workspaceId: string, domain: string) {
    return this._http.delete(this.BASE_API_URL + `/workspaces/${workspaceId}/domains/${domain}`);
  }

  /**
   * This function is responsible for fetching the lists of domain from which sign-up to a particular workspace is allowed
   * @param workspaceId 
   */
  getAllowedDomains(workspaceId: string) {
    return this._http.get(this.BASE_API_URL + '/workspaces/'+ workspaceId + '/domains');
  }

  /**
   * This function is responsible for inviting a user to Join your current workspace
   * @param workspaceId - workspaceId of the current workspace
   * @param email - Email of the user, whom we would like to send the invitation
   * @param userId - 
   */
  inviteNewUserViaEmail(workspaceId: string, email: string, userId: string) {
    
    let emailData: { workspace_id: string, email: string, user_id: string } = {
      workspace_id: workspaceId,
      email: email,
      user_id: userId
    }

    return this._http.post(this.BASE_API_URL + '/workspace/inviteUserViaEmail', emailData);
  }

  updateUserRole(data) {
    return this._http.put<any>(this.BASE_API_URL + '/workspace/updateUserRole', data);
  }

  removeUser(workspaceId, userId) {
    return this._http.delete(this.BASE_API_URL + `/workspaces/${workspaceId}/users/${userId}`);
  }
}
