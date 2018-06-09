import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class WorkspaceService {

  constructor(private _http: HttpClient) { }
  BASE_URL = this.BASE_URL;
  getWorkspace(workspace) {
    console.log('workapce insdie workspace service : ', workspace);

    return this._http.get<any>(this.BASE_URL + '/workspace/' + workspace._id);
  }
}
