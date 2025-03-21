import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { CRMService } from 'src/shared/services/crm-service/crm.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-new-crm-company-dialog',
  templateUrl: './new-crm-company-dialog.component.html',
  styleUrls: ['./new-crm-company-dialog.component.scss']
})
export class NewCRMCompanyDialogComponent implements OnInit {

  @Output() companyCreated = new EventEmitter();
  @Output() companyEdited = new EventEmitter();

  companyData: any = {
    name: '',
    description: '',
    _workspace: null
  };

  enableSave = false;

  imageToUpload: File;

  workspaceData: any;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private crmService: CRMService,
    private mdDialogRef: MatDialogRef<NewCRMCompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.utilityService.objectExists(this.workspaceData)) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    this.companyData._workspace = this.workspaceData;

    if (!!this.data && !!this.data.companyId) {
      await this.crmService.getCRMCompany(this.data.companyId).then(res => {
        this.companyData = res['company'];
      });
    }

    this.setEnableSave();
  }

  onCompanyInfoEdited(newCompanyDetails: any) {
    this.companyData = newCompanyDetails;

    this.setEnableSave();
  }

  onCompanyImageEdited(newCompanyImage: any) {
    this.imageToUpload = newCompanyImage;

    this.setEnableSave();
  }

  saveCompany() {
    if (this.enableSave) {
      this.utilityService.asyncNotification($localize`:@@newCRMCompanyDialogComponent.pleaseWaitWeSave:Please wait we are saving the company...`, new Promise((resolve, reject) => {
        if (!!this.companyData._id) {
          this.crmService.updateCRMCompany(this.companyData, this.imageToUpload).then(res => {
            this.companyData = res['company'];
            this.companyEdited.emit(this.companyData);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@newCRMCompanyDialogComponent.companyUpdated:Company updated!`));
            this.mdDialogRef.close();
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@newCRMCompanyDialogComponent.unableToUpdateCompany:Unable to update company, please try again!`));
          });
        } else {
          this.crmService.createCRMCompany(this.companyData).then(res => {
            this.companyData = res['company'];
            this.companyCreated.emit(this.companyData);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@newCRMCompanyDialogComponent.companyCreated:Company created!`));
            this.mdDialogRef.close();
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@newCRMCompanyDialogComponent.unableToCreated:Unable to create company, please try again!`));
          });
        }
      }));
    }
  }

  /**
    * This function opens up the content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
  async openUploadImageDetails(content) {
   this.utilityService.openModal(content, {});
  }

  setEnableSave() {
    this.enableSave = (!!this.companyData && !!this.companyData?.name && !!this.companyData?._workspace);
  }

  closeDialog() {
    this.utilityService.getConfirmDialogAlert($localize`:@@newCRMCompanyDialog.areYouSure:Are you sure?`, $localize`:@@newCRMCompanyDialog.loseData:By doing this, you will lose all the information added in the company!`)
      .then((res) => {
        if (res.value) {
          this.mdDialogRef.close();
        }
      });
  }
}
