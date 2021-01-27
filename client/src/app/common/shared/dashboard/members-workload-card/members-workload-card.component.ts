import { Component, OnInit, Injector } from '@angular/core';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarView, CalendarWeekViewBeforeRenderEvent } from 'angular-calendar';
import { addDays, addHours, endOfDay, endOfMonth, endOfWeek, isSaturday, isSunday, startOfDay, startOfWeek, subDays } from 'date-fns';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-members-workload-card',
  templateUrl: './members-workload-card.component.html',
  styleUrls: ['./members-workload-card.component.scss']
})
export class MembersWorkloadCardComponent implements OnInit {

  public publicFunctions = new PublicFunctions(this.injector);

  userData;
  groupData;
  groupMembers = [];
  groupTasks;

  //date for calendar Nav
  dates: any = [];

  monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  currentDate: any = new Date();

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Base URL
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  constructor(
    private injector: Injector,
    private groupService: GroupService,
    public utilityService: UtilityService
  ) { }

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);

    this.userData = await this.publicFunctions.getCurrentUser();
    this.groupData = await this.publicFunctions.getCurrentGroup();

    await this.initTable();

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
  }

  async initTable() {

    // this.period = (this.userData?.stats?.group_dashboard_members_period) ? this.userData.stats.group_dashboard_members_period : 'this_week';

    await this.groupService.getAllGroupMembers(this.groupData?._id).then(res => {
      this.groupMembers = res['users'];
    });

    // this.groupTasks = await this.publicFunctions.getAllGroupTasks(this.groupData?._id, this.period);

    // await this.assignTasks();

    // this.chartsReady = true;

    ////////////////////
    this.generateNavDate();
  }

  async generateNavDate() {
    for (var i = 0; i < 7; i++) {
      const date = addDays(startOfWeek(new Date()), i);
      this.dates.push({ day: date.getDate(), date: date, month: date.getMonth(), isweekend: (isSaturday(date) || isSunday(date)) });
    }
  }

  /**
   * This function is responsible for opening a fullscreen dialog to see the member profile
   */
  openFullscreenModal(userId: string): void {
    this.utilityService.openFullscreenModal(userId);
  }
}
