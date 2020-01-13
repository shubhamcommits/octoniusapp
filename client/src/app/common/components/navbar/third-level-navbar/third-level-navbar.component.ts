import {Component, OnInit} from '@angular/core';
import {environment} from "../../../../../environments/environment";
import {GroupService} from "../../../../shared/services/group.service";
import {ActivatedRoute} from "@angular/router";
import {GroupDataService} from "../../../../shared/services/group-data.service";
import {UserService} from "../../../../shared/services/user.service";
import {NgxUiLoaderService} from "ngx-ui-loader";

@Component({
  selector: 'third-level-navbar',
  templateUrl: './third-level-navbar.component.html',
  styleUrls: ['./third-level-navbar.component.scss']
})
export class ThirdLevelNavbarComponent implements OnInit {

  group_id;
  groupImageUrl = '';
  group: any = {};

  user;
  profilePic = '';

  isItMyWorkplace = false;

  ownerOfGroup: boolean = false;  // True if the current user is the owner of the public group

  BASE_URL = environment.BASE_URL;

  constructor(private groupService: GroupService, private _activatedRoute: ActivatedRoute,
              private groupDataService: GroupDataService, private userService: UserService,
              private ngxService: NgxUiLoaderService) {
  }

  async ngOnInit() {
    this.ngxService.start();
    this.group_id = this.groupDataService.groupId;
    this.isItMyWorkplace = this._activatedRoute.snapshot.queryParamMap.get('myworkplace') == 'true' || false;
    await this.loadUser();
    if (this.isItMyWorkplace) {
      await this.getPrivateGroup();
    } else {
      // group needs to be defined
      await this.loadGroup()
        .then(() => {
          this.ngxService.stop();
        })
        .catch((err) => {
          console.log('Error while loading the group', err);
        })
    }

  }

  getPrivateGroup() {
    return new Promise((resolve, reject) => {

      this.groupService.getPrivateGroup()
        .subscribe(async (res) => {
          this.group = res['privateGroup'];
          this.group_id = res['privateGroup']['_id'];
          this.group.group_name = 'My Space';
          this.groupImageUrl = await this.profilePic == null
            ? '/assets/images/user.png' : environment.BASE_URL + `/uploads/${this.profilePic}`;
          resolve();
        }, (err) => {
          reject(err);
        })
    })
  }

  loadGroup() {
    return new Promise((resolve, reject) => {
      this.groupService.getGroup(this.group_id)
        .subscribe(async (res) => {
          this.groupImageUrl = await res['group']['group_avatar'] == null
            ? '/assets/images/group.png' : environment.BASE_URL + `/uploads/${res['group']['group_avatar']}`;

          this.group.group_name = res['group']['group_name'];
          this.group = res['group'];
          this.groupDataService.group = res['group'];

          // Determine if the current user is the admin of the group
          // @ts-ignore
          this.group.type = res.group.type;
          let admin = this.groupDataService._group._admins.filter(_user => {
            return _user._id.toString() === this.user._id.toString();
          });

          if (admin.length > 0) {
            this.ownerOfGroup = true;
          }

          if (this.group.group_name === 'private') {
            this.isItMyWorkplace = true;
            this.group.group_name = 'My Space';
            this.groupImageUrl = await this.profilePic == null
              ? '/assets/images/user.png' : environment.BASE_URL + `/uploads/${this.profilePic}`;
          }
          resolve();
        }, (err) => {
          reject(err);
        });
    })

  }

  loadUser() {
    return new Promise((resolve, reject) => {
      this.userService.getUser()
        .subscribe((res) => {
            this.user = res['user'];
            this.profilePic = this.user.profile_pic;
            resolve();
          },
          err => reject(err)
        );
    });
  }

  sendGroupData() {
    this.groupDataService.sendGroupData(this.group);
  }

}
