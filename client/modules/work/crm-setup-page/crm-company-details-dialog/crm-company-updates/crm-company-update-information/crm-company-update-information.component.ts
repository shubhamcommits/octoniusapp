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
  selector: "app-crm-company-update-information",
  templateUrl: "./crm-company-update-information.component.html",
  styleUrls: ["./crm-company-update-information.component.scss"],
})
export class CRMCompanyUpdateInformationComponent implements OnInit {
  @Output() companyUpdateInfoCreated = new EventEmitter();
  @Output() companyUpdateInfoEdited = new EventEmitter();

  companyId;
  updateData;
  workspaceData;
  userData;

  description = "";
  date = "";

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private crmService: CRMService,
    private mdDialogRef: MatDialogRef<CRMCompanyUpdateInformationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector
  ) {}

  async ngOnInit(): Promise<void> {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    if (!!this.data && !!this.data.update) {
      this.updateData = this.data.update;
    } else {
      this.updateData = {
        description: "",
        date: DateTime.now(),
        completed: false,
        _assigned_to: [],
      };
    }

    if (!!this.data && !!this.data.companyId) {
      this.companyId = this.data.companyId;
    }

    if (!!this.updateData) {
      this.description = this.updateData.description;
      this.date = this.updateData.date;
    }
  }

  fieldEdited(propertyName: string) {
    switch (propertyName) {
      case "description":
        this.updateData[propertyName] = this.description;
        break;
    }
  }

  closeDialog() {
    this.mdDialogRef.close();
  }

  saveUpdate() {
    if (!this.updateData?._id) {
      this.crmService
        .addCompanyUpdate(this.companyId, this.updateData)
        .then((res) => {
          this.companyUpdateInfoCreated.emit(res["company"]);
          this.crmService.triggerFunc();
        });
    } else {
      this.crmService
        .updateCompanyUpdate(this.companyId, this.updateData)
        .then((res) => {
          this.companyUpdateInfoEdited.emit(this.updateData);
          this.crmService.triggerFunc();
        });
    }

    this.closeDialog();
  }

  onAssignedAdded(data: any) {
    if (!this.updateData._assigned_to) {
      this.updateData._assigned_to = [];
    }
    this.updateData._assigned_to.push(data);

    this.crmService
      .updateCompanyUpdate(this.companyId, this.updateData)
      .then((res) => {
        this.companyUpdateInfoEdited.emit(res["company"]);
      });
  }

  onAssignedRemoved(data: any) {
    const assigneeIndex = !!this.updateData._assigned_to
      ? this.updateData._assigned_to.findIndex(
          (assignee) => data == assignee._id || assignee
        )
      : -1;
    if (assigneeIndex >= 0) {
      this.updateData._assigned_to.splice(assigneeIndex, 1);
    }
    this.crmService
      .updateCompanyUpdate(this.companyId, this.updateData)
      .then((res) => {
        this.companyUpdateInfoEdited.emit(res["company"]);
      });
  }
}
