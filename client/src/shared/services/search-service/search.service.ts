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
}
