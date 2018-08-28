import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class PostService {

  BASE_API_URL = environment.BASE_API_URL;


  constructor(private _http: HttpClient) { }

  getGroupPosts(group_id) {
    return this._http.get(this.BASE_API_URL + '/post/' + group_id);
  }

  getGroup(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id);
  }

  addNewNormalPost(post) {
    return this._http.post(this.BASE_API_URL + '/post/add', post);
  }
  addNewEventPost(post) {
    return this._http.post(this.BASE_API_URL + '/post/add', post);
  }
  addNewTaskPost(post) {
    return this._http.post(this.BASE_API_URL + '/post/add', post);
  }
  addNewComment(comment) {
    return this._http.post(this.BASE_API_URL + '/post/addComment', comment);
  }
  editPost(post){
    return this._http.post(this.BASE_API_URL + '/post/edit ', post);
  }
  deletePost(post) {

    // console.log('post inside the delete service: ', post);

    return this._http.put<any>(this.BASE_API_URL + '/post', post);
  }
  complete(post) {
    return this._http.post(this.BASE_API_URL + '/post/complete', post);
  }
  like(post) {
    return this._http.post(this.BASE_API_URL + '/post/like', post);
  }
  unlike(post) {
    return this._http.post(this.BASE_API_URL + '/post/unlike', post);
  }
  useroverviewposts(user_id, today){
    return this._http.get(this.BASE_API_URL + '/post/userOverview/'+ user_id+'/'+today);
  }
}
