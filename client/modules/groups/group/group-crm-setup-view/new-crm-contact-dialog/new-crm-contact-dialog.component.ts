import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
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
    _group: null,
    phones: [],
    emails: [],
    links: [],
    company_history: []
  };

  groupData: any;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private crmGroupService: CRMGroupService,
    private mdDialogRef: MatDialogRef<NewCRMContactDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector
  ) { }

  async ngOnInit(): Promise<void> {
    if (!this.utilityService.objectExists(this.groupData)) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    this.contactData._group = this.groupData;

    if (!!this.data && !!this.data.contactId) {
      await this.crmGroupService.getCRMContact(this.data.contactId).then(res => {
        this.contactData = res['contact'];
      });
    }
  }

  onContactInfoEdited(newContactDetails: any) {
    this.contactData = newContactDetails;
  }

  onContactCompanyEdited(newContactDetails: any) {
    this.contactData = newContactDetails;
  }

  onContactCFEdited(newContactDetails: any) {
    this.contactData = newContactDetails;
  }

  saveContact() {
    if (!!this.contactData._id) {
      this.crmGroupService.updateCRMContact(this.contactData).then(res => {
        this.contactData = res['contact'];
        this.contactEdited.emit(this.contactData);
      });
    } else {
      this.crmGroupService.createCRMContact(this.contactData).then(res => {
        this.contactData = res['contact'];
        this.contactCreated.emit(this.contactData);
      });
    }

    this.mdDialogRef.close();
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
