import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
} from "@angular/core";
import { PublicFunctions } from "modules/public.functions";
import { DatesService } from "src/shared/services/dates-service/dates.service";
import { UtilityService } from "src/shared/services/utility-service/utility.service";
import { DateTime } from "luxon";
import { CRMCompanyTaskInformationComponent } from "./crm-company-task-information/crm-company-task-information.component";
import { MatDialog } from "@angular/material/dialog";
import { CRMService } from "src/shared/services/crm-service/crm.service";

@Component({
  selector: "app-crm-company-tasks",
  templateUrl: "./crm-company-tasks.component.html",
  styleUrls: ["./crm-company-tasks.component.scss"],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CRMCompanyTasksComponent implements OnInit {
  @Input() companyData;

  userData;
  workspaceData;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private crmService: CRMService,
    private datesService: DatesService,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private injector: Injector
  ) {}

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  addNewTask() {
    this.openTaskDialog({
      description: "",
      date: DateTime.now(),
      completed: false,
      _assigned_to: [],
      _created_by: this.userData,
    });
  }

  changeCompletedStatus(task) {
    task.completed = !task.completed;
    this.crmService
      .updateCompanyTask(this.companyData?._id, task)
      .then((res) => {});
  }

  openTaskDialog(task) {
    const dialogRef = this.dialog.open(CRMCompanyTaskInformationComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: "50%",
      data: {
        task: task,
        companyId: this.companyData?._id,
      },
    });

    const companyTaskCreatedSubs =
      dialogRef.componentInstance.companyTaskInfoCreated.subscribe(
        async (data) => {
          if (!this.companyData.tasks) {
            this.companyData.tasks = [];
          }

          this.companyData.tasks = data.tasks;
          this.cdRef.detectChanges();
        }
      );
    const companyTaskEditedSubs =
      dialogRef.componentInstance.companyTaskInfoEdited.subscribe(
        async (data) => {
          const index = this.companyData.tasks
            ? this.companyData.tasks.findIndex((p) => p._id == data._id)
            : -1;
          if (index >= 0) {
            this.companyData.tasks[index] = data;
          }
          this.cdRef.detectChanges();
        }
      );

    dialogRef.afterClosed().subscribe(async (result) => {
      companyTaskCreatedSubs.unsubscribe();
      companyTaskEditedSubs.unsubscribe();
    });
  }

  deleteTask(taskId) {
    this.utilityService
      .getConfirmDialogAlert(
        $localize`:@@crmCompanyTasks.areYouSure:Are you sure?`,
        $localize`:@@crmCompanyTasks.removeContact:By doing this, you will delete the selected task!`
      )
      .then((res) => {
        if (res.value) {
          this.crmService
            .deleteCompanyTask(this.companyData?._id, taskId)
            .then(async (res) => {
              const index = this.companyData.tasks
                ? this.companyData.tasks.findIndex((t) => t._id == taskId)
                : -1;
              if (index >= 0) {
                this.companyData.tasks.splice(index, 1);
              }
              this.cdRef.detectChanges();
              
              this.crmService.triggerFunc();
            });
        }
      });
  }

  formateDate(date) {
    return this.datesService.formateDate(date, "YYYY-MM-DD");
  }
}
