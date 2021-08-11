import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private _http: HttpClient) { }

  // BaseUrl of the Post MicroService
  baseURL = environment.POST_BASE_API_URL;

  /**
   * This function is responsible for liking a comment
   * @param commentId
   */
  like(commentId: string) {

    // Call the HTTP Request
    return this._http.post(this.baseURL + `/comments/like`, {}, {
      params: { commentId }
    }).
      toPromise()
  }

  /**
   * This function is responsible for unliking a comment
   * @param commentId
   */
  unlike(commentId: string) {

    // Call the HTTP Request
    return this._http.post(this.baseURL + `/comments/unlike`, {}, {
      params: { commentId }
    }).
      toPromise()
  }


  /**
   * This function is responsible for adding a new comment
   * @param formData
   */
  new(formData: FormData, postId: string) {
    return this._http.post(this.baseURL + '/comments/new-comment', formData, {
      params: {
        postId : postId
      }
    }).toPromise();
  }


  /**
   * This function is responsible for editing a comment
   * @param commentId
   * @param formData
   */
  edit(formData: FormData, commentId: string) {
    return this._http.post(this.baseURL + '/comments/edit-comment', formData, {
      params: {commentId}
    }).toPromise();
  }


  /**
   * This function is responsible for fetching a comment
   * @param commentId
   */
  getComment(commentId: any){
    return this._http.get(this.baseURL + '/comments/get-comment', {
      params: {commentId}
    }).toPromise();
  }


  /**
   * This function is responsible for fetching all comments
   * @param postId
   */
  getAllComments(postId: any): Observable<any>{
    return this._http.get(this.baseURL + '/comments/allComments', {
      params: {postId}
    });
  }

  /**
   * This function is responsible for fetching top 5 comments
   * @param postId
   */
  getComments(postId: any): Observable<any>{
    return this._http.get(this.baseURL + '/comments/comments', {
      params: {postId}
    });
  }


  /**
   * This function is responsible for fetching next 5 comments
   * @param postId
   * @param commentId
   */
  getNextComments(postId: any, commentId: any){
    return this._http.get(this.baseURL + '/comments/next-comments', {
      params: {postId, commentId}
    }).toPromise();
  }


  /**
   * This function is responsible for removing a comment
   * @param commentId
   */
  remove(commentId: any){
    return this._http.post(this.baseURL + '/comments/remove-comment', {} , {
      params: {commentId}
    }).toPromise();
  }


  /**
   * This function is used to mark a comment as read
   * @param commentId
   */
  markRead(commentId: any){
    this._http.post(this.baseURL + '/comments/mark-read', {}, {
      params: {commentId}
    }).toPromise();
  }

  getCommentsCount(postId: string, period?: any) {
    return this._http.get(this.baseURL + `/comments/count`, {params:{
      period: period,
      postId: postId
    }}).toPromise();
  }
}
