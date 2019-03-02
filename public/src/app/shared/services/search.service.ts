import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Injectable()
export class SearchService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  getSearchResults(query, filter) {
    return this._http.get(this.BASE_API_URL + `/search/getSearchResults/${query}/${filter}`);
  }

  deleteSearchResult(data) {
    return this._http.delete(this.BASE_API_URL + `/search/deleteSearchResult`, data);
  }

  loadMoreResults(type, amountLoaded, query) {
    return this._http.get(this.BASE_API_URL + `/search/loadMoreResults/${type}/${amountLoaded}/${query}`);
  }

  loadRecentSearches() {
    return this._http.get(this.BASE_API_URL + `/search/user/loadRecentSearches`);
  }

  saveSearch(data) {
    return this._http.post( this.BASE_API_URL + `/search/saveSearch`, data);
  }

  search(data) {
    return this._http.get(this.BASE_API_URL + `/search/searchNav/${data.query}/${data.filter}`, );
  }
}
