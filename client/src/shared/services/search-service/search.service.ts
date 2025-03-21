import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private _http: HttpClient
  ) { }

  localURL: string = environment.SEARCH_BASE_API_URL;

  getSearchResults(textQuery: string, filter: string, advancedFilters: any) {
    return this._http.get(this.localURL + `/getSearchResults/${filter}`, {
      params:{
        textQuery: textQuery,
        advancedFilters: JSON.stringify(advancedFilters)
      }}).toPromise();
  }

  searchTasksForNS(textQuery: string, groupId: string) {
    return this._http.get(this.localURL + `/searchTasksForNS`, {
      params:{
        textQuery: textQuery,
        groupId: groupId
      }}).toPromise();
  }

  /**
   * This function is responsible for fetching workspace groups
   * @param workspaceId
   * @param groupId
   * @param query - optional parameter(which searches for name and email too)
   */
  searchAllGroupsList(workspaceId: string, query: any, groupId: string) {
    return this._http.get(this.localURL + `/groups`, {
      params: {
        workspaceId: workspaceId,
        query: query,
        groupId: groupId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching workspace users
   * @param workspaceId
   * @param groupId
   * @param query - optional parameter(which searches for name and email too)
   */
  searchAllUsersList(workspaceId: string, query: any) {
    return this._http.get(this.localURL + `/users`, {
      params: {
        workspaceId: workspaceId,
        query: query
      }
    }).toPromise()
  }
}
