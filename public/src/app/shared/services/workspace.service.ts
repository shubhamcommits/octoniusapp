
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class WorkspaceService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  getWorkspace(workspace) {
    return this._http.get<any>(this.BASE_API_URL + '/workspace/' + workspace._id);
  }

  updateWorkspace(workspce_id, data) {
    return this._http.put(this.BASE_API_URL + `/workspace/${workspce_id}`, data);
  }

  // Workspace billing

  createSubscription(token, amount) {
    const data = {token, amount};
    return this._http.post(this.BASE_API_URL + `/billing/createSubscription`, data);
  }

  getBillingStatus(workspaceId) {
    return this._http.get(this.BASE_API_URL + `/billing/getBillingStatus/${workspaceId}`);
  }

  getSubscription() {
    return this._http.get(this.BASE_API_URL + `/billing/getSubscription`);
  }
}
