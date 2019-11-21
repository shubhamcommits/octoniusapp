import {Component, OnInit} from '@angular/core';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {UserService} from '../../../shared/services/user.service';
import {GroupDataService} from "../../../shared/services/group-data.service";

@Component({
  selector: 'app-overview-my-agenda',
  templateUrl: './overview-my-agenda.component.html',
  styleUrls: ['./overview-my-agenda.component.scss']
})
export class OverviewMyAgendaComponent implements OnInit {

  todayTimelineEvents: unknown = [];
  thisWeekTimelineEvents: any = [];

  viewDate: Date = new Date();

  constructor(private ngxService: NgxUiLoaderService, private groupDataService: GroupDataService, private userService: UserService) {

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

}


