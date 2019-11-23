import {Component, OnInit} from '@angular/core';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {UserService} from '../../../shared/services/user.service';
import {GroupDataService} from "../../../shared/services/group-data.service";
import moment from "moment";

@Component({
  selector: 'app-overview-my-agenda',
  templateUrl: './overview-my-agenda.component.html',
  styleUrls: ['./overview-my-agenda.component.scss']
})
export class OverviewMyAgendaComponent implements OnInit {

  todayTimelineEvents: any = [];
  thisWeekTimelineEvents: any = [];

  viewDate: Date = new Date();

  currentHour;

  constructor(private ngxService: NgxUiLoaderService, private groupDataService: GroupDataService, private userService: UserService) {

  }

  async ngOnInit() {
    this.ngxService.start();
    setTimeout(() => {
      this.ngxService.stop();
    }, 500);

    this.todayTimelineEvents = await this.getTodayTimelineEvents();
    this.thisWeekTimelineEvents = await this.getThisWeekTimelineEvents();

    this.currentHour = moment(this.viewDate).hour();
  }

  getTodayTimelineEvents() {
    return new Promise((resolve, reject) => {

      //TODO: extract current USER
      const data = {
        userId: '5dd2ed0d2ec9072dad7316ab'
      };

      this.userService.getUserTodayEvents(data)
        .subscribe((res) => {

          console.log('User timeline events:', res);

          resolve(res['events']);
        }, () => {
          reject([]);
        });
    });
  }

  getThisWeekTimelineEvents() {
    return new Promise((resolve, reject) => {

      const data = {
        userId: '5dd2ed0d2ec9072dad7316ab'
      };

      this.userService.getUserThisWeekEvents(data)
        .subscribe((res) => {

          console.log('User timeline events:', res);

          resolve(res['events']);
        }, () => {
          reject([]);
        });
    });
  }

  isTimelineEventExpired(eventDueTo) {
    return moment(moment(eventDueTo)).isBefore(moment(this.viewDate));
  }

  isTimelineEventInFuture(eventDueTo) {
    return moment(moment(eventDueTo)).isAfter(moment(this.viewDate));
  }

  isTimelineEventInPresent(eventDueTo) {

    return moment(moment(eventDueTo)).isBetween(moment(this.viewDate), moment(this.viewDate).add(30, 'minutes'));
  }
}


