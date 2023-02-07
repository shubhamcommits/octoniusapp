import { Component, Input, OnInit } from '@angular/core';
import { connect } from 'http2';
import moment from 'moment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
// ;


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

  constructor(public utilityService: UtilityService) { }

  async ngOnInit() {
    // let converter = new QuillDeltaToHtmlConverter(JSON.parse(this.message?.content)['ops'], {});
    // if (converter) {
    //   // Convert into html
    //   this.htmlContent = converter.convert();
    // }

    this.htmlContent = await this.convertToHTML();

    if (!this.previousMessage || (this.previousMessage && this.previousMessage?.posted_on
        && this.message && this.message?.posted_on
        && !moment(this.message?.posted_on).isSame(moment(this.previousMessage?.posted_on), 'day'))) {
      this.showDay = true;
    } else {
      this.showDay = false;
    }
  }

  convertToHTML() {
    return this.message.content;
  }

  formateDate(date: any) {
    return (date) ? moment(moment.utc(date)).format("MM/DD/YYYY") : '';
  }

  formateHour(date: any) {
    return (date) ? moment(moment.utc(date)).format("HH:mm") : '';
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return this.utilityService.objectExists(object);
  }
}
