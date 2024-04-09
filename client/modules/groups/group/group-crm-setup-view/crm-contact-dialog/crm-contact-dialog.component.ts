import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-crm-contact-dialog',
  templateUrl: './crm-contact-dialog.component.html',
  styleUrls: ['./crm-contact-dialog.component.scss']
})
export class CRMContactDialogComponent implements OnInit {

  @Output() contactCreated = new EventEmitter();
  @Output() contactEdited = new EventEmitter();

  contactData: any = {
    name: '',
    _group: null,
    phones: [],
    emails: [],
    links: [],
    _company: '',
    position: ''
  };

  groupData: any;
  workspaceData: any;

  crmContactCustomFields;
  selectedCFValues = [];

  cfSearchText = '';
  cfSearchPlaceholder = $localize`:@@crmContactDialog.cfSearchPlaceholder:Search`;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private crmGroupService: CRMGroupService,
    private mdDialogRef: MatDialogRef<CRMContactDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector
  ) { }

  async ngOnInit(): Promise<void> {
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.contactData._group = this.groupData;

    if (!!this.data && !!this.data.contactId) {
      await this.crmGroupService.getCRMContact(this.data.contactId).then(res => {
        this.contactData = res['contact'];
      });
    }
  
    this.initCustomFields();
  }

  async initCustomFields() {
    let customFieldsTmp = this.groupData?.crm_custom_fields;

    if (!customFieldsTmp) {
      await this.crmGroupService.getCRMGroupCustomFields(this.groupData?._id).then((res) => {
        if (res['crm_custom_fields']) {
          customFieldsTmp = res['crm_custom_fields'];
        }
      });
    }

    if (customFieldsTmp) {
      this.crmContactCustomFields = [];
      
      customFieldsTmp.forEach(field => {
        if (!field?.company_type) {
          if (!field.input_type) {
            field.values.sort((v1, v2) => (v1 > v2) ? 1 : -1);
          }
          this.crmContactCustomFields.push(field);

          if (!this.contactData?.crm_custom_fields) {
            this.contactData.crm_custom_fields = new Map<string, string>();
          }

          if (!this.contactData?.crm_custom_fields[field.name]) {
            this.contactData.crm_custom_fields[field.name] = '';
            this.selectedCFValues[field.name] = '';
          } else {
            this.selectedCFValues[field.name] = this.contactData?.crm_custom_fields[field.name];
          }
        }
      });
    }
  }

  closeDialog() {
    this.mdDialogRef.close();
  }
}
