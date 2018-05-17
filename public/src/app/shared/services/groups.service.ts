import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class GroupsService {

  BASE_URL = 'http://localhost:3000';
  BASE_API_URL = 'http://localhost:3000/api';

  constructor(private _http: HttpClient) { }

  createNewGroup(group) {
    return this._http.post(this.BASE_API_URL + '/workspace/groups/', group);
  }


  getUserGroups(user) {
    return this._http.get(this.BASE_API_URL + '/workspace/groups/' + user.user_id + '/' + user.workspace_id);
  }
}
