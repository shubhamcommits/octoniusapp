import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private _http: HttpClient,
    private injector: Injector
  ) { }

  localURL: string = environment.SEARCH_BASE_API_URL;

  getSearchResults(query: string, filter: string, advancedFilters: any) {
    return this._http.get(this.localURL + `/getSearchResults/${filter}/${query}`, {
      params:{
        advancedFilters: JSON.stringify(advancedFilters)
      }}).toPromise();
  }

  /********************

  searchPostByQuery(request: any){
    return this._http.post(this.localURL + '/post', request).toPromise();
  }

  searchUserByQuery(request: any){
    return this._http.post(this.localURL + '/user', request).toPromise();
  }

  searchFileByQuery(request: any){
    return this._http.post(this.localURL + '/file', request).toPromise();
  }

  deleteSearchResult(data) {
    return this._http.delete(this.localURL + `/deleteSearchResult`, data).toPromise();
  }

  loadMoreResults(type, amountLoaded, query) {
    return this._http.get(this.localURL + `/loadMoreResults/${type}/${amountLoaded}/${query}`).toPromise();
  }

  loadRecentSearches() {
    return this._http.get(this.localURL + `/user/loadRecentSearches`).toPromise();
  }

  saveSearch(data) {
    return this._http.post( this.localURL + `/saveSearch`, data).toPromise();
  }

  search(data) {
    return this._http.get(this.localURL + `/searchNav/${data.query}/${data.filter}`).toPromise();
  }

  getSkillsSearchResults(query) {
    return this._http.get(this.localURL + `/getSkillsSearchResults/${query}`).toPromise();
  }
  getTagsSearchResults(query) {
    return this._http.get(this.localURL + `/getTagsSearchResults/${query}`).toPromise();
  }
  */
}
