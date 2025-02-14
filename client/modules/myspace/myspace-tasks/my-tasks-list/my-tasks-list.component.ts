import { Component, OnInit, Injector, ViewChild, TemplateRef, Input, OnDestroy } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { DatesService } from 'src/shared/services/dates-service/dates.service';
import { CRMService } from 'src/shared/services/crm-service/crm.service';
import { MatDialog } from '@angular/material/dialog';

import { CRMCompanyDetailsDialogComponent } from "modules/work/crm-setup-page/crm-company-details-dialog/crm-company-details-dialog.component";
import { SubSink } from "subsink";

import { DateTime } from 'luxon';
@Component({
  selector: 'app-my-tasks-list',
  templateUrl: './my-tasks-list.component.html',
  styleUrls: ['./my-tasks-list.component.scss']
})
export class MyTasksListComponent implements OnInit, OnDestroy {

  @Input() userData: any;
  
  // Modal Content
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  companyDueTasks: any = [];
  groupDueTasks: any = [];

  post: any;
  today = '';
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

    this.today = DateTime.utc().startOf("day").toJSDate();    
  }

  async ngOnInit() {

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    await this.loadTasks();
    // this.groupDueTasks = this.sortTasksByPriority(this.groupDueTasks);

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
    this.groupDueTasks = await this.getGroupDueTasks();
    this.groupDueTasks['overdue_today'] = await this.publicFunctions.filterRAGTasks(this.groupDueTasks['overdue_today'], this.userData);
    this.groupDueTasks['tomorrow'] = await this.publicFunctions.filterRAGTasks(this.groupDueTasks['tomorrow'], this.userData);
    this.groupDueTasks['this_week'] = await this.publicFunctions.filterRAGTasks(this.groupDueTasks['this_week'], this.userData);
    this.groupDueTasks['next_week'] = await this.publicFunctions.filterRAGTasks(this.groupDueTasks['next_week'], this.userData);
    this.groupDueTasks['future'] = await this.publicFunctions.filterRAGTasks(this.groupDueTasks['future'], this.userData);
    
    this.companyDueTasks = await this.getCompanyDueTasks();
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

  async getGroupDueTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getGroupDueTasks()
        .then((res) => {
          resolve(res['tasks']);
        })
        .catch(() => {
          reject([]);
        })
    })
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
      dialogRef.afterClosed().subscribe(async result => {
        this.groupDueTasks = await this.getGroupDueTasks();
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
}
