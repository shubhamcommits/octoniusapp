import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { environment } from '../../../environments/environment';

@Injectable()
export class GroupService {


  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  getGroupPosts(group_id) {
    return this._http.get(this.BASE_API_URL + '/post/' + group_id);
  }

  getGroup(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id);
  }


  searchWorkspaceUsers(query, workspace) {
    return this._http.get(this.BASE_API_URL + `/workspace/searchWorkspaceUsers/${workspace}/${query}`);
  }

  searchGroupUsers(group_id, query) {
    console.log('Inside searchGroupUsers');

    //  return this._http.get(this.BASE_API_URL + `/group/searchGroupUsers/${group_id}/${query}`);
    return this._http.get(`${this.BASE_API_URL}/group/searchGroupUsers/${group_id}/${query}`);
  }


  addMembersInGroup(data) {
    return this._http.post(this.BASE_API_URL + '/group/addNewUsers', data);
  }

}
