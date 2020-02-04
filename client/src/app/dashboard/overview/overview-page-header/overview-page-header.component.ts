import {Component, OnInit} from "@angular/core";
import {UserService} from "../../../shared/services/user.service";
import {NgxUiLoaderService} from "ngx-ui-loader";
import {User} from "../../../shared/models/user.model";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-overview-page-header',
  templateUrl: './overview-page-header.component.html',
  styleUrls: ['./overview-page-header.component.scss']

})

export class OverviewPageHeaderComponent implements OnInit {

  user: User;
  workspaceImageUrl;
  currentAuthenticatedUser;
  user_data;

  alert = {
    class: '',
    message: ''
  };

  constructor(private _userService: UserService, private ngxService: NgxUiLoaderService) {
  }

  async ngOnInit() {
    this.ngxService.start();
    setTimeout(() => {
      this.ngxService.stop();
    }, 500);
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.currentAuthenticatedUser = await this.getCurrentAuthenticatedUser();
  }

  getCurrentAuthenticatedUser() {
    return new Promise((resolve, reject) => {
      this._userService.getUser()
        .subscribe((res) => {
          this.user = res.user;
          this.workspaceImageUrl = environment.BASE_URL + '/uploads/' + res['user']['profile_pic'];
          resolve(res['user']);
        }, (err) => {
          console.log('Error while fetching the user', err);
          reject(err);
        })
    });
  }

}
