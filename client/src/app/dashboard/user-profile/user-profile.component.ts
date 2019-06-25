import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import {ActivatedRoute} from "@angular/router";
import {ProfileDataService} from "../../shared/services/profile-data.service";
import {UserService} from "../../shared/services/user.service";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  user_data;

  constructor(
    private ngxService: NgxUiLoaderService,
    private route: ActivatedRoute,
    private profileDataService: ProfileDataService,
    private userService: UserService) { }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);

    this.user_data = JSON.parse(localStorage.getItem('user'));
   this.route.params.subscribe((params) => {
     const userId = params.userId;
     this.resetUserProfile();
     this.getUserProfile(userId);
   });

  }

  getUserProfile(userId) {
    if ( this.user_data.user_id == userId ) {
      this.userService.getUser()
        .subscribe((res) => {
          this.profileDataService.user.next(res['user']);
      });
    } else {
      this.userService.getOtherUser(userId)
        .subscribe((res) => {
          this.profileDataService.user.next(res['user']);
        });
    }
  }

  resetUserProfile(){
    this.profileDataService.user.next({});
  }

}
