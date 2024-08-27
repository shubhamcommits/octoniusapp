import { Component, EventEmitter, Injector, Input, OnChanges, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { CRMService } from 'src/shared/services/crm-service/crm.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-crm-product-custom-fields',
  templateUrl: './crm-product-custom-fields.component.html',
  styleUrls: ['./crm-product-custom-fields.component.scss']
})
export class CRMProductCustomFieldsComponent implements OnChanges {

  @Input() productData;

  @Output() productCFEdited = new EventEmitter();

  workspaceData;

  crmProductCustomFields;
  selectedCFValues = [];
  canEdit = true;

  cfSearchText = '';
  cfSearchPlaceholder = $localize`:@@crmProductCustomFields.cfSearchPlaceholder:Search`;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
		public utilityService: UtilityService,
    private crmService: CRMService,
    private injector: Injector,
  ) { }

  async ngOnChanges(): Promise<void> {
    if (!this.utilityService.objectExists(this.workspaceData)) {
			this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
		}
  
    this.initCustomFields();
  }

  async initCustomFields() {
    let customFieldsTmp = this.workspaceData?.crm_custom_fields;

    if (!customFieldsTmp) {
      await this.crmService.getCRMCustomFields().then((res) => {
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

          if (!this.productData?.crm_custom_fields) {
            this.productData.crm_custom_fields = new Map<string, string>();
          }

          if (!this.productData?.crm_custom_fields[field.name]) {
            this.productData.crm_custom_fields[field.name] = '';
            this.selectedCFValues[field.name] = '';
          } else {
            this.selectedCFValues[field.name] = this.productData?.crm_custom_fields[field.name];
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

    this.productCFEdited.emit(this.productData);
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
    this.productData.crm_custom_fields[customFieldName] = customFieldValue;

    this.productCFEdited.emit(this.productData);
  }
}
