import {
  Component,
  EventEmitter,
  Inject,
  Injector,
  OnInit,
  Output,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DateTime } from "luxon";
import { PublicFunctions } from "modules/public.functions";
import { CRMService } from "src/shared/services/crm-service/crm.service";

@Component({
  selector: "app-crm-company-task-information",
  templateUrl: "./crm-company-task-information.component.html",
  styleUrls: ["./crm-company-task-information.component.scss"],
})
export class CRMCompanyTaskInformationComponent implements OnInit {
  @Output() companyTaskInfoCreated = new EventEmitter();
  @Output() companyTaskInfoEdited = new EventEmitter();

  companyId;
  taskData;
  workspaceData;
  userData;

  description = "";
  date = "";
  completed = "";
  _assigned_to = "";

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private crmService: CRMService,
    private mdDialogRef: MatDialogRef<CRMCompanyTaskInformationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector
  ) {}

  async ngOnInit(): Promise<void> {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    if (!!this.data && !!this.data.task) {
      this.taskData = this.data.task;
    } else {
      this.taskData = {
        description: "",
        date: DateTime.now(),
        completed: false,
        _assigned_to: [],
      };
    }

    if (!!this.data && !!this.data.companyId) {
      this.companyId = this.data.companyId;
    }

    if (!!this.taskData) {
      this.description = this.taskData.description;
      this.date = this.taskData.date;
      this.completed = this.taskData.completed;
      this._assigned_to = this.taskData._assigned_to;
    }
  }

  fieldEdited(propertyName: string) {
    switch (propertyName) {
      case "description":
        this.taskData[propertyName] = this.description;
        break;
      case "completed":
        this.taskData[propertyName] = this.completed;
        break;
      case "_assigned_to":
        this.taskData[propertyName] = this._assigned_to;
        break;
    }
  }

  closeDialog() {
    this.mdDialogRef.close();
  }

  saveTask() {
    if (!this.taskData?._id) {
      this.crmService
        .addCompanyTask(this.companyId, this.taskData)
        .then((res) => {
          this.companyTaskInfoCreated.emit(res["company"]);
          this.closeDialog();
        });
    } else {
      this.crmService
        .updateCompanyTask(this.companyId, this.taskData)
        .then((res) => {
          this.companyTaskInfoEdited.emit(this.taskData);
          this.closeDialog();
        });
    }
  }

  onAssignedAdded(data: any) {
    if (!this.taskData._assigned_to) {
      this.taskData._assigned_to = [];
    }
    this.taskData._assigned_to.push(data);

    this.crmService
      .updateCompanyTask(this.companyId, this.taskData)
      .then((res) => {
        console.log(res["company"]);
        this.companyTaskInfoEdited.emit(res["company"]);
      });
  }

  onAssignedRemoved(data: any) {
    const assigneeIndex = !!this.taskData._assigned_to
      ? this.taskData._assigned_to.findIndex(
          (assignee) => data == assignee._id || assignee
        )
      : -1;
    if (assigneeIndex >= 0) {
      this.taskData._assigned_to.splice(assigneeIndex, 1);
    }
    this.crmService
      .updateCompanyTask(this.companyId, this.taskData)
      .then((res) => {
        this.companyTaskInfoEdited.emit(res["company"]);
      });
  }

  getDate(dateObject: any) {
    this.taskData.date = dateObject.toISODate();
    this.crmService
      .updateCompanyTask(this.companyId, this.taskData)
      .then((res) => {
        this.companyTaskInfoEdited.emit(res["company"]);
      });
  }
}
