import { Component, EventEmitter, Injector, Input, OnChanges, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-crm-company-custom-fields',
  templateUrl: './crm-company-custom-fields.component.html',
  styleUrls: ['./crm-company-custom-fields.component.scss']
})
export class CRMCompanyCustomFieldsComponent implements OnChanges {

  @Input() companyData;
  @Input() groupData;

  @Output() companyCFEdited = new EventEmitter();

  crmCompanyCustomFields;
  selectedCFValues = [];
  canEdit = true;

  cfSearchText = '';
  cfSearchPlaceholder = $localize`:@@crmCompanyCustomFields.cfSearchPlaceholder:Search`;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private crmGroupService: CRMGroupService,
		private utilityService: UtilityService,
    	private injector: Injector,
  ) { }

  async ngOnChanges(): Promise<void> {
    if (!!this.companyData) {
      
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
      this.crmCompanyCustomFields = [];
      
      customFieldsTmp.forEach(field => {
        if (field.company_type) {
          if (!field.input_type) {
            field.values.sort((v1, v2) => (v1 > v2) ? 1 : -1);
          }
          this.crmCompanyCustomFields.push(field);

          if (!this.companyData?.crm_custom_fields) {
            this.companyData.crm_custom_fields = new Map<string, string>();
          }

          if (!this.companyData?.crm_custom_fields[field.name]) {
            this.companyData.crm_custom_fields[field.name] = '';
            this.selectedCFValues[field.name] = '';
          } else {
            this.selectedCFValues[field.name] = this.companyData?.crm_custom_fields[field.name];
          }
        }
      });
    }
  }

  fieldEdited(propertyName: string) {
    // switch (propertyName) {
    //   case 'name':
    //     this.companyData[propertyName] = this.newName;
    //     break;
    //   case 'description':
    //     this.companyData[propertyName] = this.newDescription;
    //     break;
    // }

    this.companyCFEdited.emit(this.companyData);
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
    this.saveCustomField(cfName, cfTitle, dateObject.toDate());
  }

  saveCustomField(customFieldName: string, customFieldTitle: string, customFieldValue: string) {
    this.selectedCFValues[customFieldName] = customFieldValue;
    this.companyData.crm_custom_fields[customFieldName] = customFieldValue;

    this.companyCFEdited.emit(this.companyData);
  }

  formateDate(date) {
    return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }
}
