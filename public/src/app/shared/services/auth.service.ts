import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from '../models/workspace.model';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }


  signIn(user) {
    return this._http.post<any>(this.BASE_API_URL + '/auth/signin', user);
  }

  signUp(user) {
    return this._http.post<any>(this.BASE_API_URL + '/auth/signup', user);
  }

  signout() {
    return this._http.get<any>(this.BASE_API_URL + '/auth/signout');
  }

  createNewWorkspace(newWorksapce) {
    return this._http.post<any>(this.BASE_API_URL + '/auth/createNewWorkspace', newWorksapce);
  }

  checkWorkspaceName(workspace) {
    localStorage.setItem('newWorkspace', JSON.stringify(workspace));
    return this._http.post<any>(this.BASE_API_URL + '/auth/checkWorkspaceName', workspace);
  }
  chechUserAvailability(user) {
    return this._http.post<any>(this.BASE_API_URL + '/auth/checkUserAvailability', user);
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }
  getToken() {
    return localStorage.getItem('token');
  }


  storeUserData(token, user) {
    console.log('current user data', user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

}
