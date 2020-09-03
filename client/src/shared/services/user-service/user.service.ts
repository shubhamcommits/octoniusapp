import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  BASE_API_URL = environment.USER_BASE_API_URL;

  constructor(private _http: HttpClient) { }

  /* | ======================================= USER DETAILS ========================================== | */

  /**
   * This function fetches the details of the currently loggedIn user
   */
  getUser(): Observable<any> {
    return this._http.get(this.BASE_API_URL + `/`)
  }

  /**
   * This function fetches the details of user based on the @userId
   * @param userId
   */
  getOtherUser(userId: string): Observable<any> {
    return this._http.get(this.BASE_API_URL + `/${userId}`);
  }

  /* | ======================================= USER DETAILS ========================================== | */

  /**
   * This function updates the details of currently loggedIn user
   * @param userData
   */
  updateUser(userData: Object) {
    return this._http.put(this.BASE_API_URL + `/`, userData)
      .toPromise();
  }

  /**
   * This function is responsible for updating the user data(only profile_pic)
   * @param workspaceId
   * @param workspaceAvatar
   */
  updateUserProfileImage(fileToUpload: File): Observable<any> {

    // PREPARING FORM DATA
    let formData = new FormData();
    formData.append('profileImage', fileToUpload)

    return this._http.put(this.BASE_API_URL + `/image`, formData);
  }


  /**
   * This function is responsible for updating users' role
   * @param { userId, role }
   * @role - 'admin' or 'member'
   */
  updateUserRole(userId: string, role: string) {

    // Preparing the request body data
    let userData = {
      userId: userId.trim(),
      role: role.trim().toLowerCase()
    }

    // Call the API
    return this._http.put(this.BASE_API_URL + '/update-role', userData)
    .toPromise();
  }

  /* | ======================================= USER SKILLS ========================================== | */

  /**
   * This function fetches the skill set array of current loggedIn user
   */
  getUserSkills() {
    return this._http.get(this.BASE_API_URL + `/skills/`);
  }

  /**
   * This function fetches the skill set array of current loggedIn user
   */
  searchSkills(skill: string) {
    return this._http.get(this.BASE_API_URL + `/skills/list`, {
      params: {
        skill: skill.toString().trim()
      }
    }).toPromise();
  }

  /**
   * This function is responsible for adding a new skill to users' current skill set
   * @param skill
   */
  addSkill(skill: string): Observable<any> {
    return this._http.post(this.BASE_API_URL + `/skills/${skill}`, '');
  }

  /**
   * This function is responsible for adding a new skill to users' current skill set
   * @param skill
   */
  removeSkill(skill: string): Observable<any> {
    return this._http.delete(this.BASE_API_URL + `/skills/${skill}`);
  }

  /* | ======================================= USER SKILLS ========================================== | */


  downloadFile(file: File): Observable<any> {
    return this._http.post(this.BASE_API_URL + `/file/download`, file, { responseType: 'blob' });
  }

  getUserTasks(): Observable<any> {
    return this._http.get<any>(this.BASE_API_URL + `/tasks`);
  }

  getCompletedUserTasks(): Observable<any> {
    return this._http.get<any>(this.BASE_API_URL + `/tasksDone`);
  }

  getRecentUserTasks(postId: string): Observable<any> {
    return this._http.get<any>(this.BASE_API_URL + `/nextTasksDone/${postId}`);
  }

  getUserCalendarPosts(data: any): Observable<any> {
    return this._http.get(this.BASE_API_URL + `/${data.groupId}/user/${data.userId}/calendar/${data.year}/${data.month}`);
  }

  getLikedPostsCount() {
    return this._http.get<any>(this.BASE_API_URL + `/likedPostsCount`);
  }

  getFollowedPostsCount() {
    return this._http.get<any>(this.BASE_API_URL + `/followedPostsCount`);
  }

  /**
   * USER TODAY'S TASK
   */
  getUserTodayTasks() {
    return this._http.get(this.BASE_API_URL + `/tasks/today`).toPromise();
  }

  /**
   * USER THIS WEEK'S TASK
   */
  getUserThisWeekTasks() {
    return this._http.get(this.BASE_API_URL + `/tasks/week`).toPromise();
  }

  /**
   * USER OVERDUE TASK
   */
  getUserOverdueTasks() {
    return this._http.get(this.BASE_API_URL + `/tasks/overdue`).toPromise();
  }

  /**
   * USER TODAY'S EVENTS
   */
  getUserTodayEvents() {
    return this._http.get(this.BASE_API_URL + `/events/today`).toPromise();
  }

  /**
   * USER THIS WEEK'S EVENTS
   */
  getUserThisWeekEvents() {
    return this._http.get(this.BASE_API_URL + `/events/week`).toPromise();
  }

  /**
   * USER GLOBAL FEED
   */
  getUserGlobalFeed(userId?: string){

    if(userId != undefined)
      return this._http.get(this.BASE_API_URL + `/global/feed`, {
        params: {
          userId: userId
        }
      }).toPromise();

    else
      return this._http.get(this.BASE_API_URL + `/global/feed`).toPromise();
  }


}
