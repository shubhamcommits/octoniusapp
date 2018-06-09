import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
@Injectable()
export class AdminService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  allowDomains(data) {
    // console.log(data);
    return this._http.post<any>(this.BASE_API_URL + '/workspace/updateAllowedEmailsDomains', data);
  }
  inviteNewUserViewEmail(data) {
    // console.log(data);
    return this._http.post<any>(this.BASE_API_URL + '/workspace/inviteUserViaEmail', data);
  }

  updateUserRole(data) {
    return this._http.put<any>(this.BASE_API_URL + '/workspace/updateUserRole', data);
  }
}
