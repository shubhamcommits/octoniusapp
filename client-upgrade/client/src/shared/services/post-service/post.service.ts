import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private _http: HttpClient) { }

  // BaseUrl of the Post MicroService
  baseURL = environment.POST_BASE_API_URL;

  /**
   * This function is responsible for creating a post
   * @param { title, content, type, _posted_by, _group, _content_mentions } postData 
   */
  create(formData: FormData) {

    // Call the HTTP Request
    return this._http.post(this.baseURL + '/', formData).
    toPromise()
  }

  /**
   * This function is responsible for editing a post
   * @param postData 
   */
  edit(postId: string, formData: FormData) {

    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}`, formData).
    toPromise()
  }

  /**
   * This function fetches the list of posts present in a group
   * @param { groupId, type, lastPostId } query
   * @param lastPostId - optional
   */
  getPosts(groupId: string, type: string, lastPostId?: string) {

    // Create the request variable
    let request: any;

    if(!lastPostId)
      request = this._http.get(this.baseURL + `/`, {
      params: {
        groupId: groupId,
        type: type
      }
    }).toPromise()

    else {
      request = this._http.get(this.baseURL + `/`, {
        params: {
          groupId: groupId,
          type: type,
          lastPostId: lastPostId
        }
      }).toPromise()
    }

    return request;
  }

  /**
   * This function is resposible for changing the task status of a post
   * @param postId 
   * @param assigneeId 
   */
  changeTaskAssignee(postId: string, assigneeId: string){
    
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/task-assignee`, {
      assigneeId: assigneeId
    }).
    toPromise()
  }

  /**
   * This function is resposible for changing the task status of a post
   * @param postId 
   * @param dateDueTo
   */
  changeTaskDueDate(postId: string, dateDueTo: string){
    
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/task-due-date`, {
      date_due_to: dateDueTo
    }).
    toPromise()
  }

  /**
   * This function is resposible for changing the task status of a post
   * @param postId 
   * @param status
   */
  changeTaskStatus(postId: string, status: string){
    
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/task-status`, {
      status: status
    }).
    toPromise()
  }

  /**
   * This function is resposible for fetching tags from a group
   * @param groupId 
   * @param tag 
   */
  getTags(groupId: string, tag: string) {

    // Call the HTTP Request
    return this._http.get(this.baseURL + `/tags`, {
      params: {
        groupId: groupId,
        tag: tag
      }
    }).
      toPromise()
  }

}
