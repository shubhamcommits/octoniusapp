import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';
import * as moment from 'moment';
import * as io from 'socket.io-client';
import { environment } from '../../../../environments/environment'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user: User;
  userProfileImage;
  userId;
  alert = {
    class: '',
    message: ''
  };
  height = 10;
  width = 10;
  url='https://i.cloudup.com/Zqeq2GhGjt-3000x3000.jpeg'
  Date = new Date;

  socket = io(environment.BASE_URL);

  constructor(private _auth: AuthService, private _userService: UserService, private _router: Router,
    private router: Router) {
      this.socket.on('connect', () => {
         console.log(`Socket connected!`);
       });
 
     }

  ngOnInit() {

    console.log("%c   Octonius Inc \u00A9 " + this.Date.getFullYear() +". All Right Reserved!", "background-repeat: no-repeat; background-image: url('https://octhub.com/favicon.ico')");

    this.getUserProfile();
    const user = {
      'userId': this.userId 
      }
      this.socket.on('notificationsFeed', (user) => {
        console.log('Get Notifications socket on', user);
      });
      this.socket.emit('getNotifications', this.userId);

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
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
        this.userProfileImage = res.user['profile_pic'];
        this.userId = res.user['_id'];
        this.userProfileImage = `/uploads/${this.userProfileImage}`;
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
