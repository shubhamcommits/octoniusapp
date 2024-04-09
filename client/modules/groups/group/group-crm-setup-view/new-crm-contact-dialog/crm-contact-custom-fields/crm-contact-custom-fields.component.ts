import { Component, EventEmitter, Injector, Input, OnChanges, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-crm-contact-custom-fields',
  templateUrl: './crm-contact-custom-fields.component.html',
  styleUrls: ['./crm-contact-custom-fields.component.scss']
})
export class CRMContactCustomFieldsComponent implements OnChanges {

  @Input() contactData;
  @Input() groupData;

  @Output() contactCFEdited = new EventEmitter();

  crmContactCustomFields;
  selectedCFValues = [];
  canEdit = true;

  cfSearchText = '';
  cfSearchPlaceholder = $localize`:@@crmContactCustomFields.cfSearchPlaceholder:Search`;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private crmGroupService: CRMGroupService,
		private utilityService: UtilityService,
    	private injector: Injector,
  ) { }

  async ngOnChanges(): Promise<void> {
    if (!!this.contactData) {
      
    }

		if (!this.utilityService.objectExists(this.groupData)) {
			this.groupData = await this.publicFunctions.getCurrentGroupDetails();
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

  fieldEdited(propertyName: string) {
    // switch (propertyName) {
    //   case 'name':
    //     this.contactData[propertyName] = this.newName;
    //     break;
    //   case 'description':
    //     this.contactData[propertyName] = this.newDescription;
    //     break;
    // }

    this.contactCFEdited.emit(this.contactData);
  }

  onCustomFieldChange(event: Event, customFieldName: string, customFieldTitle: string) {
    const customFieldValue = event['value'];
    this.saveCustomField(customFieldName, customFieldTitle, customFieldValue);
  }

  saveInputCustomField(event: Event, customFieldName: string, customFieldTitle: string) {
    const customFieldValue = event.target['value'];
    this.saveCustomField(customFieldName, customFieldTitle, customFieldValue);
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getCFDate(dateObject: any, cfName: string, cfTitle: string) {
    this.saveCustomField(cfName, cfTitle, dateObject.toISODate());
  }

  saveCustomField(customFieldName: string, customFieldTitle: string, customFieldValue: string) {
    this.selectedCFValues[customFieldName] = customFieldValue;
    this.contactData.crm_custom_fields[customFieldName] = customFieldValue;

    this.contactCFEdited.emit(this.contactData);
  }

  formateDate(date) {
    return this.utilityService.formateDate(date);
    // return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }
}
