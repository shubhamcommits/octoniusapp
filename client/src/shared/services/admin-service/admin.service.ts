import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AdminService {

  constructor(private _http: HttpClient) { }

  baseURL = environment.WORKSPACE_BASE_API_URL;

  /**
   * This function is responsible for adding the domain to list of domains from which sign-up to a particular workspace is allowed.
   * @param workspaceId 
   * @param domain 
   */
  addToAllowedDomain(workspaceId: string, domain: string) {

    let domainData: { domain: string } = {
      domain: domain.trim()
    }

    return this._http.post(this.baseURL + `/domains`, domainData, {
      params: {
        workspaceId: workspaceId
      }
    });
  }

  /**
   * This function is resposible for removing the domain from allowed domains array list.
   * @param workspaceId
   * @param domain - string name of the domain is required
   */
  removeDomain(workspaceId: string, domain: string) {
    return this._http.delete(this.baseURL + `/domains/${domain}`, {
      params: {
        workspaceId: workspaceId
      }
    });
  }

  /**
   * This function is responsible for fetching the lists of domain from which sign-up to a particular workspace is allowed
   * @param workspaceId 
   */
  getAllowedDomains(workspaceId: string) {
    return this._http.get(this.baseURL + '/domains', {
      params: {
        workspaceId: workspaceId
      }
    });
  }

  /**
   * This function is responsible for inviting a user to Join your current workspace
   * @param workspace_name - workspace_name of the current workspace
   * @param email - Email of the user, whom we would like to send the invitation
   */
  inviteNewUserViaEmail(workspace_name: string, email: string, type: string, group_name?: string) {

    return this._http.post(this.baseURL + '/invite', {
      user:{
        workspace_name: workspace_name,
        email: email.toLowerCase(),
        type: type,
        group_name: group_name
      }
    });
  }

  removeUser(workspaceId, userId) {
    return this._http.delete(this.baseURL + `/workspaces/${workspaceId}/users/${userId}`);
  }
}
