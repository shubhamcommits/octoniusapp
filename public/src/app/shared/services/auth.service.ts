import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from '../models/workspace.model';
import { User } from '../models/user.model';

@Injectable()
export class AuthService {
  workspace: Workspace;
  user: User;
  BASE_URL = 'http://localhost:3000';
  BASE_API_URL = 'http://localhost:3000/api';

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
    return this._http.post<any>(this.BASE_API_URL + '/workspace/createNewWorkspace', newWorksapce);
  }

  checkWorkspaceNameAvailbility(workspace) {
    this.workspace = workspace;
    return this._http.post<any>(this.BASE_API_URL + '/auth/searchWorkspaceNameAvailability', workspace);
  }
  searchUserAvailability(user) {
    return this._http.post<any>(this.BASE_API_URL + '/auth/searchUserAvailability', user);
  }

  getWorkspace() {
    return this.workspace;
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

  setUserData(user) {
    this.user = user;
    console.log('user in auth service:', this.user);
  }
  getUserData() {
    return this.user;
  }
}
