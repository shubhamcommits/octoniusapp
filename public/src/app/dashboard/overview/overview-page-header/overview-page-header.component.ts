import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-overview-page-header',
  templateUrl: './overview-page-header.component.html',
  styleUrls: ['./overview-page-header.component.scss']
})
export class OverviewPageHeaderComponent implements OnInit {

  user: User;

  constructor(private _userService: UserService, private _router: Router) { }

  ngOnInit() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
      }, (err) => {
        localStorage.removeItem('token');
        this._router.navigate(['']);
      });
  }

}
