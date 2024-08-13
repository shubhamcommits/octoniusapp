import { Component, Input, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { ChatService } from 'src/shared/services/chat-service/chat.service';
import { DatesService } from 'src/shared/services/dates-service/dates.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';


@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {

  @Input() message: any;
  @Input() userData: any;
  @Input() previousMessage: any

  showDay = false;

  htmlContent;

  avatarURL = '';

  constructor(
    public utilityService: UtilityService,
    private chatService: ChatService,
    private datesService: DatesService
    ) { }

  async ngOnInit() {
    this.htmlContent = await this.convertToHTML();

    if (!this.previousMessage || (this.previousMessage && this.previousMessage?.posted_on
        && this.message && this.message?.posted_on
        && !this.datesService.isSameDay(this.message?.posted_on, this.previousMessage?.posted_on))) {
      this.showDay = true;
    } else {
      this.showDay = false;
    }
  }

  async convertToHTML() {
    return await this.chatService.decryptData('new-message', this.message.content)
    // return this.message.content;
  }

  formateDate(date: any) {
    return this.datesService.formateDate(date, "MM/DD/YYYY");
  }

  formateHour(date: any) {
    return this.datesService.formateDate(date, "HH:mm");
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return this.utilityService.objectExists(object);
  }
}
