import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {Subject} from "rxjs/Subject";

@Injectable()
export class PostService {

  BASE_API_URL = environment.BASE_API_URL;

  // handling date modal actions
  openDatePicker = new Subject();
  datePicked = new Subject();

  // handling time modal actions
  openTimePicker = new Subject();
  timePicked = new Subject();

  // handling assign-users modal actions
  openAssignUsers = new Subject();
  usersAssigned = new Subject();

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

  editPost(postId, post) {
    return this._http.put<any>(this.BASE_API_URL + `/posts/${postId}`, post);
  }

  deletePost(postId) {

    // console.log('post inside the delete service: ', post);

    return this._http.delete(this.BASE_API_URL + `/posts/${postId}`);
  }

  complete(postId, status) {
    return this._http.put(this.BASE_API_URL + `/posts/${postId}/taskStatus`, status);
  }

  getCalendarPosts(data) {
    return this._http.get(this.BASE_API_URL + `/groups/${data.groupId}/calendar/${data.year}/${data.month}`);
  }

  like(post) {
    return this._http.put(this.BASE_API_URL + `/posts/${post.post_id}/like`, post);
  }

  likeComment(comment) {
    return this._http.put(this.BASE_API_URL + `/posts/comments/${comment._id}/like`, comment);
  }

  unlike(post) {
    return this._http.put(this.BASE_API_URL + `/posts/${post.post_id}/unlike`, post);
  }

  unlikeComment(comment) {
    return this._http.put(this.BASE_API_URL + `/posts/comments/${comment._id}/unlike`, comment);
  }

  useroverviewposts(user_id){
    return this._http.get(this.BASE_API_URL + '/users/overview/');
  }

  getPost(postId){
    return this._http.get(this.BASE_API_URL + '/posts/'+ postId);
  }

  addNewComment(postId, comment) {
    return this._http.post(this.BASE_API_URL + `/posts/${postId}/comments`, comment);
  }
  getComment(commentId){
    return this._http.get(this.BASE_API_URL + `/posts/comments/${commentId}`);
  }
  getComments(postId) {
    return this._http.get(this.BASE_API_URL + `/posts/${postId}/comments`);
  }
  getNextComments(postId, commentId){
    return this._http.get(this.BASE_API_URL + `/posts/${postId}/nextComments/${commentId}`);
  }
  updateComment(commentId, comment){
    return this._http.put(this.BASE_API_URL + `/posts/comments/${commentId}`, comment);
  }
  deleteComment(commentId){
    return this._http.delete(this.BASE_API_URL + `/posts/comments/${commentId}`);
  }

  playAudio() {
    const audio = new Audio();
    audio.src = "/assets/audio/intuition.ogg";
    audio.load();
    audio.play();
  }

  uploadQuillFiles(file: File) {
    const fd = new FormData();
    fd.append('attachments', file);
    return this._http.post(this.BASE_API_URL + '/posts/upload', fd);
  }
}
