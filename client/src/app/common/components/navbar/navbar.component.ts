import {Component, OnInit, ViewChild} from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';
import moment from 'moment';
import io from 'socket.io-client';
import { environment } from '../../../../environments/environment'
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { async } from '@angular/core/testing'
import {WorkspaceService} from "../../../shared/services/workspace.service";
import {SearchService} from "../../../shared/services/search.service";

import { Cacheable, CacheBuster } from 'ngx-cacheable';

const cacheBuster$ = new Subject<void>();

var profile_pic: any;


// Further ideas for notifications under consideration
// 1. when the user gets mentioned and assigned a task at the same time we should maybe just display 1 notification instead of two?
// 2. we might want to change name generateFeed to generateFeedAndEmitToUser
// 3. when you click the notification in the feed and you relocate, the red sign doesn't disappear until you click outside the feed window
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @ViewChild('searchDrop', { static: false }) searchDrop;

  user: User;
  userProfileImage;
  user_data;
  isLoading$ = new BehaviorSubject(false);
  alert = {
    class: '',
    message: ''
  };

  notifications_data: any;

  Date = new Date;

  socket = io(environment.BASE_URL, {
    path: '/socket.io',
    transports: ['websocket'],
    secure: true,
  });

  isCollapsed = true;
  BASE_URL = environment.BASE_URL;


  constructor(
    private _auth: AuthService,
    private _userService: UserService,
    private _router: Router,
    private router: Router,
    private workspaceService: WorkspaceService,
    private searchService: SearchService) {
      this.user_data = JSON.parse(localStorage.getItem('user'));
     }

  async ngOnInit() {

    await this.socket.on('connect', async () => {
      // we can probably delete this  second parameter since every server request already has access to the current userId
      await this.socket.emit('joinUser', this.user_data.user_id);
    });

    await this.getUserProfile();
      const user = {
        'userId': this.user_data.user_id
        };
        this.socket.on('notificationsFeed', (feed) => {
          this.notifications_data = feed;
         // console.log(this.notifications_data);
        });
        this.socket.emit('getNotifications', this.user_data.user_id);

    }

  gotToPostPage(groupId, postId) {
   this.router.navigate(['dashboard', 'group', groupId, 'post', postId]);
  }

  refreshPage() {
    location.reload();
}

  toggled(event) {
    if (event) {
       // console.log('is open');
    } else {
     // console.log('is closed');
      if(this.notifications_data['unreadNotifications'].length > 0){

        this.socket.emit('markRead', this.notifications_data['unreadNotifications'][0]._id , this.user_data.user_id);

      }

    }
  }

  underline_navbar_overview(){
    const x = document.getElementById("li_overview");
    const y = document.getElementById("li_group");
    const z = document.getElementById("li_admin");

    if( z != null){
      x.className = "active";
      y.className = "none";
      z.className = "none";
    }

  }


  underline_navbar_group(){
    const x = document.getElementById("li_overview");
    const y = document.getElementById("li_group");
    const z = document.getElementById("li_admin");
    if( z != null){
      y.className = "active";
      x.className = "none";
      z.className = "none";
    }

  }


  underline_navbar_admin(){
    const x = document.getElementById("li_overview");
    const y = document.getElementById("li_group");
    const z = document.getElementById("li_admin");
    if( z!= null){
      z.className = "active";
      y.className = "none";
      x.className = "none";
    }
  }


  getUserProfile() {
    this.isLoading$.next(false);
    this._userService.getUser()
      .subscribe(async (res) => {
        this.user = await res.user;
        this.userProfileImage = await res.user['profile_pic'];
      //  console.log(this.user._id);

      if (this.user['profile_pic'] == null) {
        this.userProfileImage = 'assets/images/user.png';
      } else {
        // console.log('Inside else');
        this.userProfileImage = await `${environment.BASE_URL}/uploads/${this.user['profile_pic']}`;
       }
        this.isLoading$.next(true);
        profile_pic = await this.userProfileImage;
      }, (err) => {
        this.alert.class = 'alert alert-danger';
        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);
        } else if (err.status) {
          this.alert.class = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or no internet connection';
        }
      });
  }
  onSignOut() {
    this._auth.signout()
      .subscribe((res) => {
        localStorage.clear();
        this.router.navigate(['']);

      }, (err) => {
        this.alert.class = 'danger';

        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            sessionStorage.clear();         
            this.router.navigate(['']);
          }, 2000);
        } else if (err.status) {
          this.alert.message = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or you internet is not working';
        }

      });
  }
  public closeAlert() {
    this.alert.message = '';
  }

}

export { profile_pic }
