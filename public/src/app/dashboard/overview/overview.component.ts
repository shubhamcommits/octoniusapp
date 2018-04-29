import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  user: User;

  constructor(private _userService: UserService, private _authService: AuthService, private _router: Router) { }

  ngOnInit() {

    // console.log('inside overview component', this._authService.getUserData());
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
      }, (err) => {
        this._router.navigate(['']);
      });
  }

}
