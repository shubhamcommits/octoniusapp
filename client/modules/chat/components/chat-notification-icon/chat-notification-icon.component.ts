import { Component, OnChanges, Input } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';


@Component({
  selector: 'app-chat-notification-icon',
  templateUrl: './chat-notification-icon.component.html',
  styleUrls: ['./chat-notification-icon.component.scss']
})
export class ChatNotificationIconComponent implements OnChanges {

  // User Data Variable
  @Input() userData: any;
  @Input() numUnreadMessages: number = 0;

  constructor(public utilityService: UtilityService) { }

  ngOnChanges() {
    
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return this.utilityService.objectExists(object);
  }
}
