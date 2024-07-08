import { Component, EventEmitter, Injector, Input, OnChanges, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-crm-order-custom-fields',
  templateUrl: './crm-order-custom-fields.component.html',
  styleUrls: ['./crm-order-custom-fields.component.scss']
})
export class CRMOrderCustomFieldsComponent implements OnChanges {

  @Input() orderData;
  @Input() groupData;

  @Output() orderCFEdited = new EventEmitter();

  crmProductCustomFields;
  selectedCFValues = [];
  canEdit = true;

  cfSearchText = '';
  cfSearchPlaceholder = $localize`:@@crmProductCustomFields.cfSearchPlaceholder:Search`;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
		public utilityService: UtilityService,
    private crmGroupService: CRMGroupService,
    private injector: Injector,
  ) { }

  async ngOnChanges(): Promise<void> {
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
      this.crmProductCustomFields = [];
      
      customFieldsTmp.forEach(field => {
        if (field.type == 'product') {
          if (!field.input_type) {
            field.values.sort((v1, v2) => (v1 > v2) ? 1 : -1);
          }
          this.crmProductCustomFields.push(field);

          if (!this.orderData?.crm_custom_fields) {
            this.orderData.crm_custom_fields = new Map<string, string>();
          }

          if (!this.orderData?.crm_custom_fields[field.name]) {
            this.orderData.crm_custom_fields[field.name] = '';
            this.selectedCFValues[field.name] = '';
          } else {
            this.selectedCFValues[field.name] = this.orderData?.crm_custom_fields[field.name];
          }
        }
      });
    }
  }

  fieldEdited(propertyName: string) {
    // switch (propertyName) {
    //   case 'name':
    //     this.productData[propertyName] = this.newName;
    //     break;
    //   case 'description':
    //     this.productData[propertyName] = this.newDescription;
    //     break;
    // }

    this.orderCFEdited.emit(this.orderData);
  }

  onCustomFieldChange(event: Event, customFieldName: string) {
    const customFieldValue = event['value'];
    this.saveCustomField(customFieldName, customFieldValue);
  }

  saveInputCustomField(event: Event, customFieldName: string) {
    const customFieldValue = event.target['value'];
    this.saveCustomField(customFieldName, customFieldValue);
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getCFDate(dateObject: any, cfName: string, cfTitle: string) {
    this.saveCustomField(cfName, dateObject.toISODate());
  }

  saveCustomField(customFieldName: string, customFieldValue: string) {
    this.selectedCFValues[customFieldName] = customFieldValue;
    this.orderData.crm_custom_fields[customFieldName] = customFieldValue;

    this.orderCFEdited.emit(this.orderData);
  }
}
