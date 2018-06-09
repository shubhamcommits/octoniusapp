import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class PostService {

  BASE_URL = 'http://localhost:3000';
  BASE_API_URL = environment.BASE_API_URL;


  constructor(private _http: HttpClient) { }

  getGroupPosts(group_id) {
    return this._http.get(this.BASE_API_URL + '/post/' + group_id);
  }

  getGroup(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id);
  }

  addNewNormalPost(post) {
    return this._http.post(this.BASE_API_URL + '/post/normal', post);
  }
  addNewEventPost(post) {
    return this._http.post(this.BASE_API_URL + '/post/event', post);
  }
  addNewTaskPost(post) {
    return this._http.post(this.BASE_API_URL + '/post/task', post);
  }
  addNewComment(comment) {
    return this._http.post(this.BASE_API_URL + '/post/addComment', comment);
  }
}
