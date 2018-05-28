import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
@Injectable()
export class GroupService {

  baseUrl = 'https://api.cdnjs.com/libraries';
  queryUrl = '?search=';

  BASE_URL = 'http://localhost:3000';
  BASE_API_URL = 'http://localhost:3000/api';
  group_id;

  constructor(private _http: HttpClient) { }

  getGroupPosts(group_id) {
    return this._http.get(this.BASE_API_URL + '/post/' + group_id);
  }

  getGroup(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id);
  }


  searchWorkspaceUsers(query, workspace) {
    return this._http.get(this.BASE_API_URL + '/group/' + workspace + '/' + query);
  }

  searchGroupUsers(term) {
    return this._http
      .get(this.baseUrl + this.queryUrl + term);
  }


  addMembersInGroup(data) {
    return this._http.post(this.BASE_API_URL + '/group/addNewUsers', data);
  }

}
