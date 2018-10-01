import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class WorkspaceService {

  constructor(private _http: HttpClient) { }
  BASE_API_URL = environment.BASE_API_URL;
  getWorkspace(workspace) {

    return this._http.get<any>(this.BASE_API_URL + '/workspace/' + workspace._id);
  }
  updateWorkspace(workspce_id, data) {


  //  console.log('workspace_id', workspce_id);
  //  console.log('data', data);


    return this._http.put(this.BASE_API_URL + `/workspace/${workspce_id}`, data);
  }
}
