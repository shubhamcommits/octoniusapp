import { Component, OnChanges, Input, OnInit } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';


@Component({
  selector: 'app-chat-title',
  templateUrl: './chat-title.component.html',
  styleUrls: ['./chat-title.component.scss']
})
export class ChatTitleComponent implements OnInit, OnChanges {

  @Input() chatData: any;
  @Input() userData: any;

  chatTitle = '';

  constructor(public utilityService: UtilityService) { }

  async ngOnInit() {
    await this.initTitle();
  }

  async ngOnChanges() {
    await this.initTitle();
  }

  async initTitle() {
    if (this.checkDataExist(this.chatData?._group)) {
      this.chatTitle = this.chatData?._group?.group_name;
    } else if (this.chatData?.members) {
      let members = this.chatData?.members;

      if (members.length > 1) {
        members = await members?.filter((member, index) => {
            return (members?.findIndex(m => m._user._id == member._user._id) == index) && member._user._id != this.userData._id
        });

        this.chatTitle = '';
        members?.forEach((member, index) => {
          if (index > 0) {
            this.chatTitle += ', ';
          }
          this.chatTitle += member?._user?.first_name + ' ' + member?._user?.last_name;
        });
      } else {
        this.chatTitle = members[0]?._user?.first_name + ' ' + members[0]?._user?.last_name;
      }
    }
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return this.utilityService.objectExists(object);
  }
}
