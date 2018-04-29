import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from '../models/workspace.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
@Injectable()
export class UserService {
  workspace: Workspace;
  user: User;

  BASE_URL = 'http://localhost:3000';
  BASE_API_URL = 'http://localhost:3000/api';

  constructor(private _http: HttpClient, private _authService: AuthService) { }


  getUser() {
    return this._http.get<any>(this.BASE_API_URL + `/user`);

  }

}
