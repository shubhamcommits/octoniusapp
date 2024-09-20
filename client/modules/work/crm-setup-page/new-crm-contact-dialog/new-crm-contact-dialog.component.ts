import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { CRMService } from 'src/shared/services/crm-service/crm.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-new-crm-contact-dialog',
  templateUrl: './new-crm-contact-dialog.component.html',
  styleUrls: ['./new-crm-contact-dialog.component.scss']
})
export class NewCRMContactDialogComponent implements OnInit {

  @Output() contactCreated = new EventEmitter();
  @Output() contactEdited = new EventEmitter();

  contactData: any = {
    name: '',
    _workspace: null,
    phones: [],
    emails: [],
    links: [],
    _company: '',
    position: ''
  };

  enableSave = false;

  groupData: any;
  workspaceData: any;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private crmService: CRMService,
    private mdDialogRef: MatDialogRef<NewCRMContactDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector
  ) { }

  async ngOnInit(): Promise<void> {
    if (!this.utilityService.objectExists(this.groupData)) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    if (!this.utilityService.objectExists(this.workspaceData)) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    this.contactData._workspace = this.workspaceData;

    if (!!this.data && !!this.data.contactId) {
      await this.crmService.getCRMContact(this.data.contactId).then(res => {
        this.contactData = res['contact'];
      });
    }

    this.setEnableSave();
  }

  onContactInfoEdited(newContactDetails: any) {
    this.contactData = newContactDetails;
    this.setEnableSave();
  }

  onContactCFEdited(newContactDetails: any) {
    this.contactData = newContactDetails;
    this.setEnableSave();
  }

  saveContact() {
    if (this.enableSave) {
      if (!!this.contactData._id) {
        this.crmService.updateCRMContact(this.contactData).then(res => {
          this.contactData = res['contact'];
          this.contactEdited.emit(this.contactData);
        });
      } else {
        this.crmService.createCRMContact(this.contactData).then(res => {
          this.contactData = res['contact'];
          this.contactCreated.emit(this.contactData);
        });
      }

      this.mdDialogRef.close();
    }
  }

  setEnableSave() {
    this.enableSave = (!!this.contactData && !!this.contactData?.name && !!this.contactData?._workspace && !!this.contactData?._company);
  }

  closeDialog() {
    this.utilityService.getConfirmDialogAlert($localize`:@@newCRMContactDialog.areYouSure:Are you sure?`, $localize`:@@newCRMContactDialog.loseData:By doing this, you will lose all the information added in the contact!`)
      .then((res) => {
        if (res.value) {
          this.mdDialogRef.close();
        }
      });
  }
}
