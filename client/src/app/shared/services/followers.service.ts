import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FollowersService {

  private apiUrl = environment.BASE_API_URL;

  constructor(private http: HttpClient) { }


  getFollowers(): Observable<Array<User>> {
    return this.http.get<Array<User>>(`${this.apiUrl}/followers`);
  }

  setFollower(follower: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/followers`, follower);
  }
}
