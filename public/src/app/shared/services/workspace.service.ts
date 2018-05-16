import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class WorkspaceService {

  constructor(private _http: HttpClient) { }
  BASE_URL = 'http://localhost:3000/api';
  getWorkspace(workspace) {
    console.log('workapce insdie workspace service : ', workspace);

     return this._http.get<any>(this.BASE_URL + '/workspace/' + workspace._id);
  }

}
