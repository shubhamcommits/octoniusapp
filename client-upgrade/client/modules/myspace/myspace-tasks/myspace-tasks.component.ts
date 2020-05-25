import { Component, OnInit, Injector, ViewChild, TemplateRef } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-myspace-tasks',
  templateUrl: './myspace-tasks.component.html',
  styleUrls: ['./myspace-tasks.component.scss']
})
export class MyspaceTasksComponent implements OnInit {

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    private modal: NgbModal,
  ) { }

  todayTasks: any = [];
  thisWeekTasks: any = [];
  overdueTasks: any = [];
  overdueAndTodayTasks = [];

  userData: any

  post: any;

  // Modal Content 
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  async ngOnInit() {

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    this.todayTasks = await this.getUserTodayTasks();
    this.thisWeekTasks = await this.getUserThisWeekTasks();
    this.overdueTasks = await this.getUserOverdueTasks();

    this.markOverdueTasks();
    this.overdueAndTodayTasks = this.overdueTasks.concat(this.todayTasks);
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  async getUserTodayTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserTodayTasks()
        .then((res) => {
          resolve(res['tasks'])
        })
        .catch(() => {
          reject([])
        })
    })
  }

  async getUserThisWeekTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserThisWeekTasks()
        .then((res) => {
          resolve(res['tasks'])
        })
        .catch(() => {
          reject([])
        })
    })
  }

  async getUserOverdueTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserOverdueTasks()
        .then((res) => {
          resolve(res['tasks'])
        })
        .catch(() => {
          reject([])
        })
    })
  }

  private markOverdueTasks() {
    this.overdueTasks = this.overdueTasks.map(task => {
      task.overdue = true;
      return task;
    });
  }

  openModal(task) {

    this.post = task;

    // Open the Modal
    this.modal.open(this.modalContent, { size: 'xl' });
  }

  ngOnDestroy(){
    this.utilityService.closeAllModals()
  }

}
