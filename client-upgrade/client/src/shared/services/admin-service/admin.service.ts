import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AdminService {

  constructor(private _http: HttpClient) { }

  baseURL = environment.BASE_API_URL;

  /**
   * This function is responsible for adding the domain to list of domains from which sign-up to a particular workspace is allowed.
   * @param workspaceId 
   * @param domain 
   */
  addToAllowedDomain(workspaceId: string, domain: string) {
    
    let domainData: { domain: string } = {
      domain: domain.trim()
    }

    return this._http.post(this.baseURL + `/workspaces/${workspaceId}/domains`, domainData);
  }

  /**
   * This function is resposible for removing the domain from allowed domains array list.
   * @param workspaceId
   * @param domain - string name of the domain is required
   */
  removeDomain(workspaceId: string, domain: string) {
    return this._http.delete(this.baseURL + `/workspaces/${workspaceId}/domains/${domain}`);
  }

  /**
   * This function is responsible for fetching the lists of domain from which sign-up to a particular workspace is allowed
   * @param workspaceId 
   */
  getAllowedDomains(workspaceId: string) {
    return this._http.get(this.baseURL + '/workspaces/'+ workspaceId + '/domains');
  }

  /**
   * This function is responsible for inviting a user to Join your current workspace
   * @param workspaceId - workspaceId of the current workspace
   * @param email - Email of the user, whom we would like to send the invitation
   * @param userId - UserId as the string of the person who is inviting.
   * @param userId (make it fetch from the redis-cache, maybe?)
   */
  inviteNewUserViaEmail(workspaceId: string, email: string, userId: string) {
    
    let emailData: { workspace_id: string, email: string, user_id: string } = {
      workspace_id: workspaceId,
      email: email,
      user_id: userId
    }

    return this._http.post(this.baseURL + '/workspace/inviteUserViaEmail', emailData);
  }

  updateUserRole(data) {
    return this._http.put<any>(this.baseURL + '/workspace/updateUserRole', data);
  }

  removeUser(workspaceId, userId) {
    return this._http.delete(this.baseURL + `/workspaces/${workspaceId}/users/${userId}`);
  }
}
