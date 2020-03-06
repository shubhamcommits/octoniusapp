import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../../shared/services/auth.service';
import {NavigationEnd, Router} from '@angular/router';
import {UserService} from '../../../shared/services/user.service';
import {User} from '../../../shared/models/user.model';
import io from 'socket.io-client';
import {environment} from '../../../../environments/environment'
import {BehaviorSubject} from 'rxjs';
import {filter} from "rxjs/operators";
import {Location} from "@angular/common";
import {SecondLevelNavbarComponent} from "./second-level-navbar/second-level-navbar.component";


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
  @ViewChild('searchDrop', {static: false}) searchDrop;
  @ViewChild(SecondLevelNavbarComponent, {static: false}) secondLevelNavbar;

  user: User;
  currentAuthenticatedUser;
  userProfileImage;
  user_data;
  isLoading$ = new BehaviorSubject(false);
  alert = {
    class: '',
    message: ''
  };

  Date = new Date;

  socket = io(environment.SOCKET_BASE_URL, {
    transports: ['websocket']
  });

  BASE_URL = environment.BASE_URL;
  navbarLevel = 0;


  constructor(private _auth: AuthService, private _userService: UserService, private _router: Router,
              private router: Router, private location: Location) {
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.setNavbarLevel(this.router.url);
  }

  async ngOnInit() {
    this.currentAuthenticatedUser = await this.getUserProfile();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setNavbarLevel(event.urlAfterRedirects);
      });
    //this.initIntercom();
  }

  /*private initIntercom() {
    (<any>window).Intercom('boot', {
      app_id: "wlumqtu3",
      name: this.currentAuthenticatedUser.first_name + ' ' + this.currentAuthenticatedUser.last_name,
      email: this.currentAuthenticatedUser.email,
      user_id: this.user_data.user_id,
      workspace: this.user_data.workspace.workspace_name,
      role: this.currentAuthenticatedUser.role,
      phone: this.currentAuthenticatedUser.integrations.mobile_number,
      company: {
        name: this.currentAuthenticatedUser.company_name,
        id: this.currentAuthenticatedUser._workspace
      }
    });
  }*/


  private setNavbarLevel(url: String) {
    if (url == '/dashboard/overview/myworkplace?myworkplace=true' || url.includes('/dashboard/group/')) {
      this.navbarLevel = 1;
    } else {
      this.navbarLevel = 0;
    }
  }

  goBack() {
   if (this.navbarLevel == 1) {
      if (this.secondLevelNavbar.isItMyWorkplace) {
        this.router.navigate(['/dashboard/overview']);
      } else {
        this.router.navigate(['/dashboard/groups']);
      }
      this.navbarLevel = 0;
    } else {
      this.location.back();
    }
  }


  getUserProfile() {
    return new Promise((resolve, reject) => {
      this.isLoading$.next(false);
      this._userService.getUser()
        .subscribe(async (res) => {
          this.user = await res.user;
          this.currentAuthenticatedUser = await res.user;
          this.userProfileImage = await res.user['profile_pic'];

          if (this.user['profile_pic'] == null) {
            this.userProfileImage = 'assets/images/user.png';
          } else {
            this.userProfileImage = await `${environment.BASE_URL}/uploads/${this.user['profile_pic']}`;
          }
          this.isLoading$.next(true);
          profile_pic = await this.userProfileImage;
          resolve(res['user']);

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
    })
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

export {profile_pic}
