import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from '../models/workspace.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class UserService {
  workspace: Workspace;
  user: User;

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient, private _authService: AuthService) { }


  getUser() {
    return this._http.get<any>(this.BASE_API_URL + `/user`);
  }
  updateUser(user) {
    return this._http.put<any>(this.BASE_API_URL + `/user`, user);

  }

}
