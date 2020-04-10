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
   * This function fetches the list of posts present in a group
   * @param { groupId, lastPostId } query
   * @param lastPostId - optional
   */
  getPosts(groupId: string, lastPostId?: string) {

    // Create the request variable
    let request: any;

    if(!lastPostId)
      request = this._http.get(this.baseURL + `/`, {
      params: {
        groupId: groupId
      }
    }).toPromise()

    else {
      request = this._http.get(this.baseURL + `/`, {
        params: {
          groupId: groupId,
          lastPostId: lastPostId
        }
      }).toPromise()
    }

    return request;
  }

}
