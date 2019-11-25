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

  now: Date = new Date();

  currentAuthenticatedUserId;

  constructor(private ngxService: NgxUiLoaderService, private groupDataService: GroupDataService, private userService: UserService) {

  }

  async ngOnInit() {
    this.ngxService.start();
    setTimeout(() => {
      this.ngxService.stop();
    }, 500);

    this.currentAuthenticatedUserId = await this.getCurrentAuthenticatedUser();
    this.todayTimelineEvents = await this.getTodayTimelineEvents();
    this.thisWeekTimelineEvents = await this.getThisWeekTimelineEvents();
  }

  getTodayTimelineEvents() {
    return new Promise((resolve, reject) => {
      const data = {
        userId: this.currentAuthenticatedUserId
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
    return moment(moment(eventDueTo)).isBefore(moment(this.now));
  }

  isTimelineEventInFuture(eventDueTo) {
    return moment(moment(eventDueTo)).isAfter(moment(this.now));
  }

  isTimelineEventInPresent(eventDueTo) {
    return moment(moment(eventDueTo)).isBetween(moment(this.now), moment(this.now).add(moment(eventDueTo).minute(), 'minutes'));
  }

  getCurrentAuthenticatedUser() {
    return new Promise((resolve, reject) => {
      this.userService.getUser()
        .subscribe((res) => {
          resolve(res['user']._id);
        }, (err) => {
          console.log('Error while fetching the user', err);
          reject(err);
        })
    })
  }
}


