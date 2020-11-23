import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class WorkspaceService {

  BASE_API_URL = environment.WORKSPACE_BASE_API_URL;

  constructor(
    private _http: HttpClient
    ) { }

  /**
   * This function is responsible for fetching the list of workspaces
   * @param workspaceId
   */
  getWorkspaces() {
    return this._http.get<any>(this.BASE_API_URL + '/');
  }

  /**
   * This function is responsible for fetching the number of groups in a workspace
   * @param workspaceId
   */
  getNumberGroupsByWorkspace(workspaceId: string) {
    return this._http.get<any>(`${this.BASE_API_URL}/${workspaceId}/numGroups`).toPromise();
  }

  /**
   * This function is responsible for deleting the workspace
   * @param workspaceId
   */
  removeWorkspace(workspaceId: string) {
    return this._http.delete<any>(`${this.BASE_API_URL}/${workspaceId}`).toPromise();
  }
}
