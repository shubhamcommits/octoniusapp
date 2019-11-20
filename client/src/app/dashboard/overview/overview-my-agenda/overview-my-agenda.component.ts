import {Component, OnInit} from '@angular/core';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {UserService} from '../../../shared/services/user.service';
import moment from 'moment';
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

      const year = moment(this.viewDate).year();
      const month = moment(this.viewDate).month();
      const groupId = this.groupDataService.groupId;

      const data = {
        userId: 'All Team',
        groupId: groupId,
        year,
        month
      };

      console.log('GroupId = ' + groupId);
      console.log(data);

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


