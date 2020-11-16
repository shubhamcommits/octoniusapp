import { Component, Input, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-assignee-avatar',
  templateUrl: './assignee-avatar.component.html',
  styleUrls: ['./assignee-avatar.component.scss']
})
export class AssigneeAvatarComponent implements OnChanges {

  @Input() post;
  @Input() userData;

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  numberAssignees = '';

  constructor() { }

  ngOnChanges() {
    if (this.post && this.post._assigned_to) {
      this.numberAssignees = '+' + (this.post._assigned_to.length - 1);
    }
  }

  getAssigneePic(post) {
    let profilePic = '';
    if (post._assigned_to && post._assigned_to.length > 0) {
      const index = post._assigned_to.findIndex(assignee => assignee._id == this.userData._id);
      if (index < 0) {
        profilePic = this.baseUrl + '/' + post._assigned_to[0].profile_pic;
      } else {
        profilePic = this.baseUrl + '/' + post._assigned_to[index].profile_pic;
      }
    } else {
      profilePic = 'assets/images/user.png';
    }
    return profilePic;
  }

}
