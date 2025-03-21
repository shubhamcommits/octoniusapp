import { Component, Injector, Input, OnChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-assignee-avatar',
  templateUrl: './assignee-avatar.component.html',
  styleUrls: ['./assignee-avatar.component.scss']
})
export class AssigneeAvatarComponent implements OnChanges {

  @Input() post;
  @Input() userData;

  assignee;
  numberAssignees = '';
  profilePic = 'assets/images/user.png';
  assigneeTooltip = '';

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
      private injector: Injector,
      private utilityService: UtilityService
    ) { }

  async ngOnChanges() {
    if (!this.utilityService.objectExists(this.userData)) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    if (this.utilityService.objectExists(this.post) && this.utilityService.arrayExists(this.post._assigned_to)) {
      this.numberAssignees = '+' + (this.post._assigned_to.length - 1);

      this.getAssignee(this.post?._assigned_to);
    }
  }

  async getAssignee(_assigned_to) {
    if (this.utilityService.objectExists(this.userData)) {
      const index = _assigned_to.findIndex(assignee => (assignee._id || assignee) == this.userData._id);
      let assigneeTmp;
      if (index < 0) {
        assigneeTmp = _assigned_to[0];
      } else {
        assigneeTmp = _assigned_to[index];
      }

      if (typeof assigneeTmp === 'string' && assigneeTmp !== null) {
        this.assignee = await this.publicFunctions.getOtherUser(assigneeTmp);
      } else {
        this.assignee = assigneeTmp;
      }

      this.profilePic = this.assignee.profile_pic;
      this.assigneeTooltip = this.assignee.first_name + ' ' + this.assignee.last_name;
    }
  }
}
