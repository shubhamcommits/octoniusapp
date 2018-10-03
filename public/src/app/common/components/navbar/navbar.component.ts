import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';
import * as moment from 'moment';
import * as io from 'socket.io-client';
import { environment } from '../../../../environments/environment'
import { BehaviorSubject } from 'rxjs';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user: User;
  userProfileImage;
  user_data;
  isLoading$ = new BehaviorSubject(false);
  alert = {
    class: '',
    message: ''
  };

  notifications_data;

  Date = new Date;

  socket = io(environment.BASE_URL);

  constructor(private _auth: AuthService, private _userService: UserService, private _router: Router,
    private router: Router) {
      this.socket.on('connect', () => {
         console.log(`Socket connected!`);
       });
       
       this.user_data = JSON.parse(localStorage.getItem('user'));
      // console.log('Stuff', this.user_data);
 
     }

  ngOnInit() {

    console.log("%c   Octonius Inc \u00A9 " + this.Date.getFullYear() +". All Right Reserved!", "background-repeat: no-repeat; background-image: url('https://octhub.com/favicon.ico')");
    this.getUserProfile();
      const user = {
        'userId': this.user_data.user_id 
        }
        this.socket.on('notificationsFeed', (user) => {
          console.log('Get Notifications socket on', user);
          this.notifications_data = user;
        });
        this.socket.emit('getNotifications', this.user_data.user_id);

  

  }

  underline_navbar_overview(){  
    const x = document.getElementById("li_overview");
    const y = document.getElementById("li_group");
    const z = document.getElementById("li_admin");
    x.className = "active";
    y.className = "none";
    z.className = "none";
  }

  
  underline_navbar_group(){
    const x = document.getElementById("li_overview");
    const y = document.getElementById("li_group");
    const z = document.getElementById("li_admin");
    y.className = "active";
    x.className = "none";
    z.className = "none";
  }

  
  underline_navbar_admin(){
    const x = document.getElementById("li_overview");
    const y = document.getElementById("li_group");
    const z = document.getElementById("li_admin");
    z.className = "active";
    y.className = "none";
    x.className = "none";
  }

  getUserProfile() {
    this.isLoading$.next(false);
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
        this.userProfileImage = res.user['profile_pic'];
      //  console.log(this.user._id);
        this.userProfileImage = `/uploads/${this.userProfileImage}`;
        this.isLoading$.next(true);
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
