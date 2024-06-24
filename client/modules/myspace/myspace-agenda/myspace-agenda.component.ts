import { Component, OnInit, ViewChild, TemplateRef, Injector, Input } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import moment from 'moment/moment';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-myspace-agenda',
  templateUrl: './myspace-agenda.component.html',
  styleUrls: ['./myspace-agenda.component.scss']
})
export class MyspaceAgendaComponent implements OnInit {

  // Modal Content
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>

  todayTimelineEvents: any = [];

  thisWeekTimelineEvents: any = [];

  now: string = moment().format();

  userData: any;

  groupData: any;

  post: any;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private userService: UserService,
    private injector: Injector,
    public utilityService: UtilityService) {

  }

  async ngOnInit() {
    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the current group
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    this.todayTimelineEvents = await this.getTodayTimelineEvents();
    this.thisWeekTimelineEvents = await this.getThisWeekTimelineEvents();

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'home'
    })
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  openModal(event) {
    this.post = event;
    const canOpen = !this.groupData?.enabled_rights || this.post?.canView || this.post?.canEdit;
    const dialogRef = this.utilityService.openPostDetailsFullscreenModal(this.post._id, this.groupData._id, canOpen);

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.updateEvent(data);
      });
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
      });
    }
  }

  ngOnDestroy() {
    this.utilityService.closeAllModals()
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

  updateEvent(post) {
    let index = this.todayTimelineEvents.findIndex((event: any) => event._id === post._id);
    if (index !== -1) {
      this.todayTimelineEvents[index] = post;
    }

    index = this.thisWeekTimelineEvents.findIndex((event: any) => event._id === post._id);
    if (index !== -1) {
      this.thisWeekTimelineEvents[index] = post;
    }
  }
}
