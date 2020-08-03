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
   * @param postId
   * @param formData
   */
  edit(postId: string, formData: FormData) {

    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}`, formData).
    toPromise()
  }

  /**
   * This function is responsible for fetching a post details
   * @param postId
   */
  get(postId: string) {

    // Call the HTTP Request
    return this._http.get(this.baseURL + `/${postId}`).
    toPromise()
  }

  /**
   * This function is responsible for liking a post
   * @param postId 
   */
  like(postId: string){
    
    // Call the HTTP Request
    return this._http.post(this.baseURL + `/${postId}/like`, '').
    toPromise()
  }

  /**
   * This function is responsible for unliking a post
   * @param postId 
   */
  unlike(postId: string){
    
    // Call the HTTP Request
    return this._http.post(this.baseURL + `/${postId}/unlike`, '').
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

    if(!lastPostId || lastPostId === undefined || lastPostId === null)
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
   * This service function is responsible for fetching the tasks and events present in month
   * @param year 
   * @param month 
   * @param groupId 
   * @param userId 
   */
  getCalendarPosts(year: any, month: any, groupId: string, userId?: string){
    if(userId){
      return this._http.get(this.baseURL + `/calendar/timeline`, {
        params:{
          year: year,
          month: month,
          groupId: groupId,
          userId: userId
        }
      }).toPromise();
    }
    else{
      return this._http.get(this.baseURL + `/calendar/timeline`, {
        params:{
          year: year,
          month: month,
          groupId: groupId
        }
      }).toPromise();
    }
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
   * This function is resposible for changing the column of a task
   * @param postId 
   * @param title
   */
  changeTaskColumn(postId: string, title: string){
    
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/task-column`, {
      title: title
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
    return this._http.get(this.baseURL + `/group/tags`, {
      params: {
        groupId: groupId.toString().trim(),
        tag: tag.toString().trim()
      }
    }).
      toPromise()
  }


  /**
   * This function is used to delete a post
   * @param postId 
   */
  deletePost(postId: string){
    return this._http.delete(this.baseURL + `/${postId}`).toPromise();
  }

  /**
   * This function is used to save a custom field value
   * @param postId 
   */
  saveCustomField(postId: string, customFieldName: string, customFieldValue: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/customField`, {
      customFieldName: customFieldName,
      customFieldValue: customFieldValue
    }).toPromise();
  }

}
