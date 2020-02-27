import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  getUser(): Observable<any> {
    return this._http.get(this.BASE_API_URL + `/users`)
  }

  getOtherUser(userId: string): Observable<any> {
    return this._http.get(this.BASE_API_URL + `/users/getOtherUser/${userId}`);
  }

  updateUser(userData: Object): Observable<any> {
    return this._http.put<any>(this.BASE_API_URL + `/users`, userData);

  }
  downloadFile(file: File): Observable<any> {
    return this._http.post(this.BASE_API_URL + `/file/download`, file, { responseType: 'blob' });
  }

  addSkills(skills: Array<any>): Observable<any> {
    return this._http.put(this.BASE_API_URL+'/users/skills', skills);
  }

  updateUserProfileImage(fileToUpload: File): Observable<any> {
    // const formData: FormData = new FormData();
    // formData.append('profileImage', fileToUpload, fileToUpload.name);
    let image = {
      profileImage: fileToUpload
    }
    return this._http.put<any>(this.BASE_API_URL + `/users/updateImage`, image);

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
