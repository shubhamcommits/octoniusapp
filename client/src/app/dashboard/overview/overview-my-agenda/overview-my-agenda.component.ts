import {Component, OnInit} from '@angular/core';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {UserService} from '../../../shared/services/user.service';
import moment from 'moment';

@Component({
  selector: 'app-overview-my-agenda',
  templateUrl: './overview-my-agenda.component.html',
  styleUrls: ['./overview-my-agenda.component.scss']
})
export class OverviewMyAgendaComponent implements OnInit {

  todayTimelineEvents: unknown = [];
  thisWeekTimelineEvents: any = [];

  viewDate: Date = new Date();

  currentDay = moment(this.viewDate).day();
  currentYear = moment(this.viewDate).year();
  currentMonth = moment(this.viewDate).month();

  constructor(private ngxService: NgxUiLoaderService, private userService: UserService) {

  }

  async ngOnInit() {
    this.ngxService.start();
    setTimeout(() => {
      this.ngxService.stop();
    }, 500);

    this.todayTimelineEvents = await this.getTodayTimelineEvents();
    this.thisWeekTimelineEvents = await this.getThisWeekTimelineEvents();
  }

  getTodayTimelineEvents() {
    return new Promise((resolve, reject) => {

      console.log(this.currentDay + '-' + this.currentMonth + '-' + this.currentYear);

      const data = {};

      this.userService.getUserCalendarPosts(data)
        .subscribe((res) => {

          console.log('User timeline events:', res);

          resolve(res['posts']);
        }, () => {
          reject([]);
        });
    });
  }

  getThisWeekTimelineEvents() {

    // TODO: extract user timeline recent events
    return null;
  }

}


