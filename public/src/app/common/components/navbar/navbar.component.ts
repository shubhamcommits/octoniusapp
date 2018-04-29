import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { NgFlashMessageService } from 'ng-flash-messages';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user: User;

  constructor(private _auth: AuthService, private _userService: UserService, private _router: Router,
    private router: Router, private ngFlashMessageService: NgFlashMessageService) { }

  ngOnInit() {

    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
      }, (err) => {
        localStorage.removeItem('token');
        this._router.navigate(['']);
      });

  }
  onSignOut() {
    this._auth.signout()
      .subscribe((res) => {
        localStorage.removeItem('token');
        this.router.navigate(['']);
        this.ngFlashMessageService.showFlashMessage({
          // Array of messages each will be displayed in new line
          messages: ['User successfully Logged out!'],
          // Whether the flash can be dismissed by the user defaults to false
          dismissible: true,
          // Time after which the flash disappears defaults to 2000ms
          timeout: false,
          // Type of flash message, it defaults to info and success, warning, danger types can also be used
          type: 'success'
        });
      }, (err) => {
        this.ngFlashMessageService.showFlashMessage({
          // Array of messages each will be displayed in new line
          messages: ['Some thing went wrong, check your internet connection!'],
          // Whether the flash can be dismissed by the user defaults to false
          dismissible: true,
          // Time after which the flash disappears defaults to 2000ms
          timeout: false,
          // Type of flash message, it defaults to info and success, warning, danger types can also be used
          type: 'danger'
        });
      });
  }

}
