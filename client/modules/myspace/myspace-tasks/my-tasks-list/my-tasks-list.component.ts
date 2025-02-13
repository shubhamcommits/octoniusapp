import { Component, OnInit, Injector, ViewChild, TemplateRef, Input, OnDestroy } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { DatesService } from 'src/shared/services/dates-service/dates.service';
import { CRMService } from 'src/shared/services/crm-service/crm.service';
import { MatDialog } from '@angular/material/dialog';

import { CRMCompanyDetailsDialogComponent } from "modules/work/crm-setup-page/crm-company-details-dialog/crm-company-details-dialog.component";
import { SubSink } from "subsink";

@Component({
  selector: 'app-my-tasks-list',
  templateUrl: './my-tasks-list.component.html',
  styleUrls: ['./my-tasks-list.component.scss']
})
export class MyTasksListComponent implements OnInit, OnDestroy {

  @Input() userData: any;
  
  // Modal Content
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  todayTasks: any = [];
  thisWeekTasks: any = [];
  nextWeekTasks: any = [];
  futureTasks: any = [];
  overdueTasks: any = [];
  overdueAndTodayTasks: any = [];
  companyDueTasks: any = [];

  post: any;

  columns;

  contacts = [];
  companies = [];
  crmCompanyCustomFields = [];
  crmContactCustomFields = [];

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  subSink = new SubSink();

  constructor(
    public utilityService: UtilityService,
    private datesService: DatesService,
    private injector: Injector,
    public dialog: MatDialog,
    private crmService: CRMService,
  ) { 
    this.subSink.add(
      this.crmService.currentCrmData.subscribe(() => {
        this.ngOnInit();
      })
    );
  }

  async ngOnInit() {

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    await this.loadTasks();
    this.overdueAndTodayTasks = this.sortTasksByPriority(this.overdueTasks.concat(this.todayTasks));

    await this.crmService.getCRMInformation().then((res) => {
      this.contacts = res["contacts"];
      this.companies = res["companies"];
      this.crmContactCustomFields = res["crm_custom_fields"]?.filter(
        (cf) => cf.type == "contact"
      );
      this.crmCompanyCustomFields = res["crm_custom_fields"]?.filter(
        (cf) => cf.type == "company"
      );
    });
    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'home'
    });
  }

  ngOnDestroy() {
    this.utilityService.closeAllModals();
    this.subSink.unsubscribe();
  }

  async loadTasks() {
    this.todayTasks = await this.publicFunctions.filterRAGTasks(await this.getUserTodayTasks(), this.userData);
    this.thisWeekTasks = await this.publicFunctions.filterRAGTasks(await this.getUserThisWeekTasks(), this.userData);
    this.overdueTasks = await this.publicFunctions.filterRAGTasks(await this.getUserOverdueTasks(), this.userData);
    this.nextWeekTasks = await this.publicFunctions.filterRAGTasks(await this.getUserNextWeekTasks(), this.userData);
    this.futureTasks = await this.publicFunctions.filterRAGTasks(await this.getUserFutureTasks(), this.userData);
    this.companyDueTasks = await this.getCompanyDueTasks();    
    
    this.markOverdueTasks();
  }

  async getCompanyDueTasks() {
    return new Promise((resolve, reject) => {
      let crmService = this.injector.get(CRMService);
      crmService.getCompanyDueTasks()
        .then((res) => {   
          resolve(res['crm_due_tasks']);
        })
        .catch(() => {
          reject([]);
        })
    })
  }

  async getUserTodayTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserTodayTasks()
        .then((res) => {
          res['tasks'] = res['tasks'].filter((task)=> {
            return task._group != null;
          });

          resolve(res['tasks']);
        })
        .catch(() => {
          reject([]);
        })
    })
  }

  async getUserThisWeekTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserThisWeekTasks()
        .then((res) => {
          res['tasks'] = this.sortTasksByPriority(res['tasks'].filter((task)=> {
            return task._group != null
          }));
          resolve(res['tasks'])
        })
        .catch(() => {
          reject([])
        })
    })
  }

  async getUserNextWeekTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserNextWeekTasks()
        .then((res) => {
          res['tasks'] = this.sortTasksByPriority(res['tasks'].filter((task)=> {
            return task._group != null
          }));
          resolve(res['tasks'])
        })
        .catch(() => {
          reject([])
        })
    })
  }

  async getUserFutureTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserFutureTasks()
        .then((res) => {
          res['tasks'] = this.sortTasksByPriority(res['tasks'].filter((task)=> {
            return task._group != null
          }));
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
          res['tasks'] = res['tasks'].filter((task)=> {
            return task._group != null
          })
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

  async openModal(task) {

    this.post = task;

    // Open the Modal
    let dialogRef;
    const canOpen = !this.userData?._private_group?.enabled_rights || this.post?.canView || this.post?.canEdit;
    if (this.post.type === 'task' && !this.post.task._parent_task) {
      await this.publicFunctions.getAllColumns(this.post._group._id).then(data => this.columns = data);
      dialogRef = this.utilityService.openPostDetailsFullscreenModal(this.post, this.userData?._private_group?._id, canOpen, this.columns);
    } else {
      // for subtasks it is not returning the parent information, so need to make a workaround
      if (this.post.task._parent_task && !this.post.task._parent_task._id) {
          await this.publicFunctions.getPost(this.post.task._parent_task).then(post => {
            this.post.task._parent_task = post;
          });
      }
      dialogRef = this.utilityService.openPostDetailsFullscreenModal(this.post, this.userData?._private_group?._id, canOpen);
    }

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.updateTask(data);
      });
      const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
        this.onDeleteTask(data);
      });
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        deleteEventSubs.unsubscribe();
      });
    }
  }

  openCompanyDetailsDialog(companyId?: string) {
    const dialogRef = this.dialog.open(CRMCompanyDetailsDialogComponent, {
      disableClose: true,
      hasBackdrop: true,
      minWidth: "100%",
      width: "100%",
      minHeight: "100%",
      height: "100%",
      data: {
        companyId: companyId,
        crmCompanyCustomFields: this.crmCompanyCustomFields,
        crmContactCustomFields: this.crmContactCustomFields,
        contacts: this.contacts.filter(
          (c) => companyId == (c?._company?._id || c?._company)
        ),
      },
    });
  }

  updateTask(task) {
    let index = this.overdueAndTodayTasks.findIndex((t: any) => t._id === task._id);
    if (index !== -1) {
      this.overdueAndTodayTasks[index] = task;
    }

    index = this.thisWeekTasks.findIndex((t: any) => t._id === task._id);
    if (index !== -1) {
      this.thisWeekTasks[index] = task;
    }
    this.markOverdueTasks();
  }

  onDeleteTask(deletedTaskId) {
      // Find the index of the tasks inside the section
      let indexTask = this.overdueAndTodayTasks.findIndex((task: any) => task._id === deletedTaskId);
      if (indexTask != -1) {
        this.overdueAndTodayTasks.splice(indexTask, 1);
        return;
      }

      indexTask = this.thisWeekTasks.findIndex((task: any) => task._id === deletedTaskId);
      if (indexTask != -1) {
        this.thisWeekTasks.splice(indexTask, 1);
        return;
      }

      indexTask = this.nextWeekTasks.findIndex((task: any) => task._id === deletedTaskId);
      if (indexTask != -1) {
        this.nextWeekTasks.splice(indexTask, 1);
        return;
      }

      indexTask = this.futureTasks.findIndex((task: any) => task._id === deletedTaskId);
      if (indexTask != -1) {
        this.futureTasks.splice(indexTask, 1);
        return;
      }
  }

  getPriorityClass(priority: string) {
    return 'label-priority ' + priority.toLocaleLowerCase();
  }

  sortTasksByPriority(tasks: any) {
    return tasks.sort((t1, t2) => {
      return (t1?.task?.custom_fields && t2?.task?.custom_fields)
        ? (((t1?.task?.custom_fields['priority'] == 'High' && t2?.task?.custom_fields['priority'] != 'High') || (t1?.task?.custom_fields['priority'] == 'Medium' && t2?.task?.custom_fields['priority'] == 'Low'))
          ? -1 : (((t1?.task?.custom_fields['priority'] != 'High' && t2?.task?.custom_fields['priority'] == 'High') || (t1?.task?.custom_fields['priority'] == 'Low' && t2?.task?.custom_fields['priority'] == 'Medium'))
            ? 1 : 0))
        : ((t1?.task?.custom_fields && !t2?.task?.custom_fields)
          ? -1 : ((!t1?.task?.custom_fields && t2?.task?.custom_fields))
            ? 1 : 0);
    });
  }

  formateDate(date) {
    return this.datesService.formateDate(date, "MMM D, YYYY");
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }
}
