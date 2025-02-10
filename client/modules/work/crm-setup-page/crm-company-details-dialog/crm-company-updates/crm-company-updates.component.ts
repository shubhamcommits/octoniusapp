import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
} from "@angular/core";
import { PublicFunctions } from "modules/public.functions";
import { DatesService } from "src/shared/services/dates-service/dates.service";
import { UtilityService } from "src/shared/services/utility-service/utility.service";
import { DateTime } from "luxon";
import { MatDialog } from "@angular/material/dialog";
import { CRMService } from "src/shared/services/crm-service/crm.service";
import { CRMCompanyUpdateInformationComponent } from "./crm-company-update-information/crm-company-update-information.component";

@Component({
  selector: "app-crm-company-updates",
  templateUrl: "./crm-company-updates.component.html",
  styleUrls: ["./crm-company-updates.component.scss"],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CRMCompanyUpdatesComponent implements OnInit, OnChanges {
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

  async ngOnChanges() {}

  addNewUpdate() {
    this.openUpdateDialog({
      description: "",
      date: DateTime.now(),
      _created_by: this.userData,
    });
  }

  openUpdateDialog(update) {
    const dialogRef = this.dialog.open(CRMCompanyUpdateInformationComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: "50%",
      data: {
        update: update,
        companyId: this.companyData?._id,
      },
    });

    const companyUpdateCreatedSubs =
      dialogRef.componentInstance.companyUpdateInfoCreated.subscribe(
        async (data) => {
          if (!this.companyData.updates) {
            this.companyData.updates = [];
          }
          
          this.companyData.updates = data.updates;
          this.cdRef.detectChanges();
          this.crmService.updateCrmData();
        }
      );
    const companyUpdateEditedSubs =
      dialogRef.componentInstance.companyUpdateInfoEdited.subscribe(
        async (data) => {
          const index = this.companyData.updates
          ? this.companyData.updates.findIndex((p) => p._id == data._id)
          : -1;
          if (index >= 0) {
            this.companyData.updates[index] = data;
          }
          this.cdRef.detectChanges();
          this.crmService.updateCrmData();
        }
      );

    dialogRef.afterClosed().subscribe(async (result) => {
      companyUpdateCreatedSubs.unsubscribe();
      companyUpdateEditedSubs.unsubscribe();
    });
  }

  deleteUpdate(updateId) {
    this.utilityService
      .getConfirmDialogAlert(
        $localize`:@@crmCompanyUpdate.areYouSure:Are you sure?`,
        $localize`:@@crmCompanyUpdate.removeContact:By doing this, you will delete the selected update!`
      )
      .then((res) => {
        if (res.value) {
          this.crmService
            .deleteCompanyUpdate(this.companyData?._id, updateId)
            .then(async (res) => {
              const index = this.companyData.updates
                ? this.companyData.updates.findIndex((t) => t._id == updateId)
                : -1;
              if (index >= 0) {
                this.companyData.updates.splice(index, 1);
              }
              this.cdRef.detectChanges();
              this.crmService.updateCrmData();
            });
        }
      });
  }

  formateDate(date) {
    return this.datesService.formateDate(date, "YYYY-MM-DD");
  }
}
