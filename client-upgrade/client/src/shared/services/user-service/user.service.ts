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
    return this._http.get(this.BASE_API_URL + `/users`)
  }

  /**
   * This function fetches the details of user based on the @userId
   * @param userId 
   */
  getOtherUser(userId: string): Observable<any> {
    return this._http.get(this.BASE_API_URL + `/users/${userId}`);
  }

  /* | ======================================= USER DETAILS ========================================== | */

  /**
   * This function updates the details of currently loggedIn user
   * @param userData 
   */
  updateUser(userData: Object) {
    return this._http.put(this.BASE_API_URL + `/users`, userData)
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

    return this._http.put(this.BASE_API_URL + `/users/image`, formData);
  }

  /* | ======================================= USER SKILLS ========================================== | */

  /**
   * This function fetches the skill set array of current loggedIn user
   */
  getUserSkills() {
    return this._http.get(this.BASE_API_URL + `/users/skills/`);
  }

  /**
   * This function fetches the skill set array of current loggedIn user
   */
  searchSkills(skill: string) {
    return this._http.get(this.BASE_API_URL + `/users/skills/list`, {
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
    return this._http.post(this.BASE_API_URL + `/users/skills/${skill}`, '');
  }

  /**
   * This function is responsible for adding a new skill to users' current skill set
   * @param skill 
   */
  removeSkill(skill: string): Observable<any> {
    return this._http.delete(this.BASE_API_URL + `/users/skills/${skill}`);
  }

  /* | ======================================= USER SKILLS ========================================== | */


  downloadFile(file: File): Observable<any> {
    return this._http.post(this.BASE_API_URL + `/file/download`, file, { responseType: 'blob' });
  }

  getUserTasks(): Observable<any> {
    return this._http.get<any>(this.BASE_API_URL + `/users/tasks`);
  }

  getCompletedUserTasks(): Observable<any> {
    return this._http.get<any>(this.BASE_API_URL + `/users/tasksDone`);
  }

  getRecentUserTasks(postId: string): Observable<any> {
    return this._http.get<any>(this.BASE_API_URL + `/users/nextTasksDone/${postId}`);
  }

  getUserCalendarPosts(data: any): Observable<any> {
    return this._http.get(this.BASE_API_URL + `/groups/${data.groupId}/user/${data.userId}/calendar/${data.year}/${data.month}`);
  }

  getUserTodayEvents(data) {
    return this._http.get(this.BASE_API_URL + `/users/${data.userId}/todayEvents`);
  }

  getUserThisWeekEvents(data) {
    return this._http.get(this.BASE_API_URL + `/users/${data.userId}/weeklyEvents`);
  }

  getLikedPostsCount() {
    return this._http.get<any>(this.BASE_API_URL + `/users/likedPostsCount`);
  }

  getFollowedPostsCount() {
    return this._http.get<any>(this.BASE_API_URL + `/users/followedPostsCount`);
  }

  /**
   * USER TODAY'S TASK
   */
  getUserTodayTasks() {
    return this._http.get(this.BASE_API_URL + `/users/todayTasks`).toPromise();
  }

  /**
   * USER THIS WEEK'S TASK
   */
  getUserThisWeekTasks() {
    return this._http.get(this.BASE_API_URL + `/users/weeklyTasks`).toPromise();
  }

  /**
   * USER OVERDUE TASK
   */
  getUserOverdueTasks() {
    return this._http.get(this.BASE_API_URL + `/users/overdueTasks`).toPromise();
  }



}
