import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable()
export class AdminService {
  BASE_URL = 'http://localhost:3000';
  BASE_API_URL = 'http://localhost:3000/api';

  constructor(private _http: HttpClient) { }

  allowDomains(data) {
    console.log(data);
    return this._http.post<any>(this.BASE_API_URL + '/workspace/updateAllowedEmailsDomains', data);
  }
  inviteNewUserViewEmail(data) {
    console.log(data);
    return this._http.post<any>(this.BASE_API_URL + '/workspace/inviteUserViaEmail', data);
  }
}
