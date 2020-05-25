import { Component, OnInit, ViewChild, TemplateRef, Injector } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import moment from 'moment/moment';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-myspace-agenda',
  templateUrl: './myspace-agenda.component.html',
  styleUrls: ['./myspace-agenda.component.scss']
})
export class MyspaceAgendaComponent implements OnInit {


  todayTimelineEvents: any = [];
  
  thisWeekTimelineEvents: any = [];

  now: Date = new Date();

  userData: any

  post: any;

  // Modal Content 
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private userService: UserService,
    private injector: Injector,
    private utilityService: UtilityService,
    private modal: NgbModal,) {

  }

  async ngOnInit() {
    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();
    this.todayTimelineEvents = await this.getTodayTimelineEvents();
    this.thisWeekTimelineEvents = await this.getThisWeekTimelineEvents();
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  openModal(event) {

    this.post = event;

    // Open the Modal
    this.modal.open(this.modalContent, { size: 'xl' });
  }

  ngOnDestroy(){
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

}
