import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-agenda-smart-card',
  templateUrl: './agenda-smart-card.component.html',
  styleUrls: ['./agenda-smart-card.component.scss']
})
export class AgendaSmartCardComponent implements OnInit {

  constructor(
    public utilityService: UtilityService,
    private userService: UserService
  ) { }

  todayEvents: any = [];
  today_event_count:any = 0

  async ngOnInit() {
    this.todayEvents = await this.todayTimelineEvents();
    this.today_event_count = this.todayEvents.length;
  }

  todayTimelineEvents(){
    return new Promise((resolve, reject)=>{
      this.userService.getUserTodayEvents()
        .then((res) => {
          resolve(res['events'])
        }).catch(() => {
          reject([])
        })
    })
  }

}
