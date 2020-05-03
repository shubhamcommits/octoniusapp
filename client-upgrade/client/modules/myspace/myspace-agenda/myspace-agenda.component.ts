import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import moment from 'moment';

@Component({
  selector: 'app-myspace-agenda',
  templateUrl: './myspace-agenda.component.html',
  styleUrls: ['./myspace-agenda.component.scss']
})
export class MyspaceAgendaComponent implements OnInit {


  todayTimelineEvents: any = [];
  thisWeekTimelineEvents: any = [];

  now: Date = new Date();

  constructor(private userService: UserService) {

  }

  async ngOnInit() {
    this.todayTimelineEvents = await this.getTodayTimelineEvents();
    this.thisWeekTimelineEvents = await this.getThisWeekTimelineEvents();
  }

  getTodayTimelineEvents() {
    return new Promise((resolve, reject) => {
      this.userService.getUserTodayEvents()
        .then((res) => {

          resolve(res['events'])

        }).catch(() => {
          
          reject([])

        })
    })
  }

  getThisWeekTimelineEvents() {
    return new Promise((resolve, reject) => {
      this.userService.getUserThisWeekEvents()
        .then((res) => {

          resolve(res['events']);

        }).catch(() => {
          
          reject([])

        })
    })
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

}
