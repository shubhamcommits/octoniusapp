import {
  Component,
  EventEmitter,
  Inject,
  Injector,
  OnInit,
  Output,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { PublicFunctions } from "modules/public.functions";
import { CRMService } from "src/shared/services/crm-service/crm.service";
import { UtilityService } from "src/shared/services/utility-service/utility.service";

@Component({
  selector: "app-crm-company-details-dialog",
  templateUrl: "./crm-company-details-dialog.component.html",
  styleUrls: ["./crm-company-details-dialog.component.scss"],
})
export class CRMCompanyDetailsDialogComponent implements OnInit {
  @Output() companyCreated = new EventEmitter();
  @Output() companyEdited = new EventEmitter();

  companyData: any = {
    name: "",
    description: "",
    _workspace: null,
  };

  contacts;

  crmCompanyCustomFields;
  crmContactCustomFields;

  enableSave = false;

  imageToUpload: File;

  workspaceData: any;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private crmService: CRMService,
    private mdDialogRef: MatDialogRef<CRMCompanyDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.utilityService.objectExists(this.workspaceData)) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    this.companyData._workspace = this.workspaceData;

    if (!!this.data) {
      if (!!this.data.companyId) {
        await this.crmService.getCRMCompany(this.data.companyId).then((res) => {
          this.companyData = res["company"];
        });
      }

      if (!!this.data.crmCompanyCustomFields) {
        this.crmCompanyCustomFields = this.data.crmCompanyCustomFields;
      }

      if (!!this.data.crmContactCustomFields) {
        this.crmContactCustomFields = this.data.crmContactCustomFields;
      }

      if (!!this.data.contacts) {
        this.contacts = this.data.contacts;
      }
    }
  }

  closeDialog() {
    this.mdDialogRef.close();
  }
}
