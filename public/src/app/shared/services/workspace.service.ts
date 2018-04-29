import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class WorkspaceService {

  constructor(private _http: HttpClient) { }
  BASE_URL = 'http://localhost:3000/api';
  getWorkspace(user) {

    return this._http.get<any>(this.BASE_URL + '/workspace/' + user._workspace);
  }

}
