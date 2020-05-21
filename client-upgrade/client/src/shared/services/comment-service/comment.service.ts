import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
   * @param postId 
   * @param content 
   * @param contentMentions 
   * @param _highlighted_content_range 
   */
  new(postId: any, content: any, contentMentions: any, _highlighted_content_range: any) {
    return this._http.post(this.baseURL + '/comments/new-comment', {
      content, contentMentions, _highlighted_content_range
    }, {
      params: { 
        postId : postId
      }
    }).toPromise()
  }


  /**
   * This function is responsible for editing a comment
   * @param commentId 
   * @param content 
   * @param contentMentions 
   */
  edit(commentId: any, content: any, contentMentions: any) {
    return this._http.post(this.baseURL + '/edit-comment', {
      content, contentMentions
    }, {
      params: { commentId }
    });
  }


  /**
   * This function is responsible for fetching a comment
   * @param commentId 
   */
  getComment(commentId: any) {
    return this._http.get(this.baseURL + '/get-comment', {
      params: { commentId }
    });
  }


  /**
   * This function is responsible for fetching all comments
   * @param postId 
   */
  getComments(postId: any) {
    return this._http.get(this.baseURL + '/comments', {
      params: { postId }
    })
  }


  /**
   * This function is responsible for fetching next 5 comments
   * @param postId 
   * @param commentId 
   */
  getNextComments(postId: any, commentId: any) {
    return this._http.get(this.baseURL + '/next-comments', {
      params: { postId, commentId }
    });
  }


  /**
   * This function is responsible for removing a comment
   * @param commentId 
   */
  remove(commentId: any) {
    return this._http.post(this.baseURL + '/remove-comment', {}, {
      params: { commentId }
    });
  }


  /**
   * This function is used to mark a comment as read
   * @param commentId 
   */
  markRead(commentId: any) {
    this._http.post(this.baseURL + '/mark-read', {}, {
      params: { commentId }
    });
  }
}
