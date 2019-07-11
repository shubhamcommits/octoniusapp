import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from '../models/workspace.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Cacheable } from 'ngx-cacheable';

@Injectable()
export class UserService {
  workspace: Workspace;
  user: User;

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient, private _authService: AuthService) { }

  @Cacheable()
  getUser() {
    return this._http.get<any>(this.BASE_API_URL + `/users`);
  }

  @Cacheable()
  getOtherUser(userId) {
    return this._http.get(this.BASE_API_URL + `/users/getOtherUser/${userId}`);
  }

  updateUser(user) {
    return this._http.put<any>(this.BASE_API_URL + `/users`, user);

  }
  downloadFile(file) {
    return this._http.post(this.BASE_API_URL + `/file/download`, file, { responseType: 'blob' });
  }

  addSkills(skills){
    return this._http.put(this.BASE_API_URL+'/users/skills', skills);
  }

  updateUserProfileImage(fileToUpload: File) {
    const formData: FormData = new FormData();
    formData.append('profileImage', fileToUpload, fileToUpload.name);
  // console.log('formData:', formData);
  //  console.log('fileToUpload:', fileToUpload);

    return this._http.put<any>(this.BASE_API_URL + `/users/updateImage`, formData);

  }

  @Cacheable()
  getUserTasks() {
    return this._http.get<any>(this.BASE_API_URL + `/users/tasks`);
  }

  @Cacheable()
  getCompletedUserTasks() {
    return this._http.get<any>(this.BASE_API_URL + `/users/tasksDone`);
  }

  @Cacheable()
  getRecentUserTasks(postId) {
    return this._http.get<any>(this.BASE_API_URL + `/users/nextTasksDone/${postId}`);
  }

  @Cacheable()
  getUserCalendarPosts(data){
    return this._http.get(this.BASE_API_URL + `/groups/${data.groupId}/user/${data.userId}/calendar/${data.year}/${data.month}`);
  }


}
