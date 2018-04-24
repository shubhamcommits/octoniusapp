import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    console.log(user);

    return this._http.post<any>(this.BASE_API_URL + '/auth/signin', user);
  }

  signUp(user) {
    return this._http.post<any>(this.BASE_API_URL + '/auth/signup', user);
  }

  signout() {

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
}
