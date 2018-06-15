import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  alert = {
    message: '',
    class: ''
  };
  user: any;
  join_date;
  constructor(private _userService: UserService, private _router: Router) { }

  ngOnInit() {
    this.getUserProfile();
  }

  getUserProfile() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;

        this.join_date = new Date(res.user['company_join_date'].year,
          (res.user['company_join_date'].month) - 1, res.user['company_join_date'].day);
        // console.log('user Inside profile:', res);

      }, (err) => {
        this.alert.class = 'alert alert-danger';
        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);
        } else if (err.status) {
          //  this.alert.class = err.error.message;
        } else {
          // this.alert.message = 'Error! either server is down or no internet connection';
        }
      });
  }
}
