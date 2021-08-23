import { Component, Injector, Input, OnChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
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
  assigneeTooltip = '';

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
      private injector: Injector
    ) { }

  ngOnChanges() {
    if (this.post && this.post._assigned_to) {
      this.numberAssignees = '+' + (this.post._assigned_to.length - 1);
      this.getAssigneeTooltip(this.post?._assigned_to)
    }
  }

  getAssigneePic(_assigned_to) {
    let profilePic = '';
    if (_assigned_to && _assigned_to.length > 0) {
      const index = _assigned_to.findIndex(assignee => assignee._id == this.userData._id);
      if (index < 0) {
        profilePic = _assigned_to[0].profile_pic;
      } else {
        profilePic = _assigned_to[index].profile_pic;
      }
    } else {
      profilePic = 'assets/images/user.png';
    }
    return profilePic;
  }

  async getAssigneeTooltip(_assigned_to) {
    if (_assigned_to.length > 0) {
      const index = _assigned_to.findIndex(assignee => (assignee._id || assignee) == this.userData._id);
      let assignee;
      if (index < 0) {
        assignee = _assigned_to[0];
      } else {
        assignee = _assigned_to[index];
      }

      if (typeof assignee === 'string' && assignee !== null) {
        assignee = await this.publicFunctions.getOtherUser(assignee);
      }

      this.assigneeTooltip = assignee.first_name + ' ' + assignee.last_name;
    }
  }
}
