import { Component, EventEmitter, Injector, Input, OnChanges, Output } from '@angular/core';
import moment from 'moment';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-crm-contact-companies',
  templateUrl: './crm-contact-companies.component.html',
  styleUrls: ['./crm-contact-companies.component.scss']
})
export class CRMContactCompaniesComponent implements OnChanges {

  @Input() contactData;

  @Output() contactCompanyEdited = new EventEmitter();

  newPosition = '';

  companyHistoryData = {
    _company: null,
    position: '',
    start_date: null,
    end_date: null
  };

  companySearchResults = [];
  companySearchText = '';

  workspaceData: any;
  
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private crmGroupService: CRMGroupService,
    private injector: Injector,
  ) { }

  async ngOnChanges(): Promise<void> {

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  fieldEdited(propertyName: string, dateObject?: any) {
    switch (propertyName) {
      // case 'position':
      //   this.companyHistoryData[propertyName] = this.newPosition;
      //   break;
      case 'start_date':
        if (!!dateObject) {
          this.companyHistoryData[propertyName] = dateObject.toDate();
        }
        break;
      case 'end_date':
        if (!!dateObject) {
          this.companyHistoryData[propertyName] = dateObject.toDate();
        }
        break;
    }
  }

  selectCompany(company: any) {
    this.companyHistoryData._company = company;
    this.companySearchText = '';
  }

  addCompanyHistory() {

    if (!this.companyHistoryData._company || !this.companyHistoryData.position || !this.companyHistoryData.start_date) {
      this.utilityService.errorNotification($localize`:@@crmContactCompanies.mandatoryFields:The company, position and start date are mandatory fields`, $localize`:@@crmContactCompanies.mandatoryFieldsTitle:Mandatory Fields`);
    } else {
      if (!this.contactData.company_history) {
        this.contactData.company_history = [];
      }

      this.contactData.company_history.push(this.companyHistoryData);

      this.contactCompanyEdited.emit(this.contactData);
    }
  }

  cleanCompanyHistory() {
    this.companyHistoryData = {
      _company: null,
      position: '',
      start_date: null,
      end_date: null
    };
  }

  deleteCompanyFromHistory(companyHistoryId: string) {
    const index = (!!this.contactData && !!this.contactData.company_history) ? this.contactData.company_history.findIndex(c => c._id == companyHistoryId) : -1;
    if (index >= 0) {
      this.contactData.company_history.splice(index, 1);
    }
  }

  searchCompany() {
    this.crmGroupService.searchCRMCompanies((this.contactData._group._id || this.contactData._group), this.companySearchText).then(res => {
        this.companySearchResults = res['companies'];
      });
  }

  formateDate(date: any) {
    return (date) ? moment(moment.utc(date)).format("MMM D, YYYY") : '';
  }
}
