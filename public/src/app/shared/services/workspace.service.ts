import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class WorkspaceService {

  constructor(private _http: HttpClient) { }
  BASE_API_URL = environment.BASE_API_URL;
  getWorkspace(workspace) {
    console.log('workapce insdie workspace service : ', workspace);

    return this._http.get<any>(this.BASE_API_URL + '/workspace/' + workspace._id);
  }
}
