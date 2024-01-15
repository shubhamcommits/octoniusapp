import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
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
    _group: null
  };

  imageToUpload: File;

  groupData: any;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private crmGroupService: CRMGroupService,
    private mdDialogRef: MatDialogRef<NewCRMCompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.utilityService.objectExists(this.groupData)) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    this.companyData._group = this.groupData;

    if (!!this.data && !!this.data.companyId) {
      await this.crmGroupService.getCRMCompany(this.data.companyId).then(res => {
        this.companyData = res['company'];
      });
    }
  }

  onCompanyInfoEdited(newCompanyDetails: any) {
    this.companyData = newCompanyDetails;
  }

  onCompanyImageEdited(newCompanyImage: any) {
    this.imageToUpload = newCompanyImage;
  }

  saveCompany() {
    if (!!this.companyData?._id) {
      this.crmGroupService.updateCRMCompany(this.companyData, this.imageToUpload, (this.groupData?._workspace?._id || this.groupData?._workspace), this.groupData?._id).then(res => {
        this.companyData = res['company'];
        this.companyEdited.emit(this.companyData);
      });
    } else {
      this.crmGroupService.createCRMCompany(this.companyData).then(res => {
        this.companyData = res['company'];
        this.companyCreated.emit(this.companyData);
      });
    }

    this.mdDialogRef.close();
  }

  /**
    * This function opens up the content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
  async openUploadImageDetails(content) {
   this.utilityService.openModal(content, {});
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
