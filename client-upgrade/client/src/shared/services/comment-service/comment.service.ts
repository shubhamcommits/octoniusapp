import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  like(commentId: string){
    
    // Call the HTTP Request
    return this._http.post(this.baseURL + `/${commentId}/like`, '').
    toPromise()
  }

  /**
   * This function is responsible for unliking a comment
   * @param commentId
   */
  unlike(commentId: string){
    
    // Call the HTTP Request
    return this._http.post(this.baseURL + `/${commentId}/unlike`, '').
    toPromise()
  }
}
