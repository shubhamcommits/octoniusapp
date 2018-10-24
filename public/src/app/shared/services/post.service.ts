import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class PostService {

  BASE_API_URL = environment.BASE_API_URL;


  constructor(private _http: HttpClient) { }

  getGroupPosts(group_id) {
    return this._http.get(this.BASE_API_URL + '/groups/' + group_id + '/posts');
  }

  getGroup(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id);
  }

  getNextPosts(group_id, last_post_id) {
    return this._http.get(this.BASE_API_URL + '/groups/' + group_id +'/nextPosts/'+ last_post_id);
  }

  addNewNormalPost(post) {
    return this._http.post(this.BASE_API_URL + '/posts', post);
  }
  addNewEventPost(post) {
    return this._http.post(this.BASE_API_URL + '/posts', post);
  }
  addNewTaskPost(post) {
    return this._http.post(this.BASE_API_URL + '/posts', post);
  }
  addNewComment(comment) {
    return this._http.post(this.BASE_API_URL + '/post/addComment', comment);
  }
  editPost(postId, post){
    return this._http.put<any>(this.BASE_API_URL + `/posts/${postId}`, post);
  }
  deletePost(postId) {

    // console.log('post inside the delete service: ', post);

    return this._http.delete(this.BASE_API_URL + `/posts/${postId}`);
  }
  complete(postId, status) {
    return this._http.post(this.BASE_API_URL + `/posts/${postId}/taskStatus`, status);
  }
  like(post) {
    return this._http.post(this.BASE_API_URL + '/post/like', post);
  }
  unlike(post) {
    return this._http.post(this.BASE_API_URL + '/post/unlike', post);
  }
  useroverviewposts(user_id){
    return this._http.get(this.BASE_API_URL + '/post/userOverview/'+ user_id);
  }

  getPost(postId){
    return this._http.get(this.BASE_API_URL + '/posts/'+ postId);
  }
}
