import { Component, OnChanges, Input, OnInit } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';


@Component({
  selector: 'app-chat-avatar',
  templateUrl: './chat-avatar.component.html',
  styleUrls: ['./chat-avatar.component.scss']
})
export class ChatAvatarComponent implements OnInit {

  @Input() chatData: any;
  @Input() userData: any;

  avatarURL = '';

  members = [];

  constructor(public utilityService: UtilityService) { }

  async ngOnInit() {
    if (this.checkDataExist(this.chatData?._group)) {
      this.avatarURL = this.chatData?._group?.group_avatar;
    } else if (this.chatData?.members) {
      this.members = this.chatData?.members;

      if (this.members.length > 1) {
        this.members = await this.members?.filter((member, index) => {
            return (this.members?.findIndex(m => m._user._id == member._user._id) == index) && member._user._id != this.userData._id
        });

        if (this.members && this.members.length == 1) {
          this.avatarURL = this.members[0]?._user?.profile_pic;
        }
      } else {
        this.avatarURL = this.members[0]?._user?.profile_pic;
      }
    }
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return this.utilityService.objectExists(object);
  }
}
