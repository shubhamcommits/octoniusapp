import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
@Injectable()
export class AdminService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  allowDomain(workspace_id, domainName) {
    // console.log(data);
    return this._http.post(this.BASE_API_URL + `/workspaces/${workspace_id}/domains`, domainName);
  }

  removeDomain(workspace_id, domainName) {
    // console.log(data);
    return this._http.delete(this.BASE_API_URL + `/workspaces/${workspace_id}/domains`, domainName);
  }

  allowedDomains(workspace_id) {
    return this._http.get(this.BASE_API_URL + '/workspaces/'+ workspace_id + '/domains');
  }

  inviteNewUserViewEmail(data) {
    // console.log(data);
    return this._http.post<any>(this.BASE_API_URL + '/workspace/inviteUserViaEmail', data);
  }

  updateUserRole(data) {
    return this._http.put<any>(this.BASE_API_URL + '/workspace/updateUserRole', data);
  }
}
