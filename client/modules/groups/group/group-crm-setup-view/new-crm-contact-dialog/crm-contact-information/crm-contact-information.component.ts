import { Component, EventEmitter, Injector, Input, OnChanges, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';

@Component({
  selector: 'app-crm-contact-information',
  templateUrl: './crm-contact-information.component.html',
  styleUrls: ['./crm-contact-information.component.scss']
})
export class CRMContactInformationComponent implements OnChanges {

  @Input() contactData;

  @Output() contactInfoEdited = new EventEmitter();

  newName = '';
  newDescription = '';
  newPhone = '';
  newEmail = '';
  newLink = '';

  companySearchResults = [];
  companySearchText = '';

  workspaceData;
  
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private crmGroupService: CRMGroupService,
    private injector: Injector,
  ) { }

  async ngOnChanges() {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    
    if (!!this.contactData) {
      this.newName = this.contactData.name;
      this.newDescription = this.contactData.description;
    }
  }

  fieldEdited(propertyName: string) {
    switch (propertyName) {
      case 'name':
        this.contactData[propertyName] = this.newName;
        break;
      case 'description':
        this.contactData[propertyName] = this.newDescription;
        break;
    }

    this.contactInfoEdited.emit(this.contactData);
  }

  addPhone() {
    if (!!this.newPhone) {
      if (!this.contactData.phones) {
        this.contactData.phones = [];
      }
      this.contactData.phones.push(this.newPhone);
      this.newPhone = '';

      this.contactInfoEdited.emit(this.contactData);
    }
  }

  addEmail() {
    if (!!this.newEmail) {
      if (!this.contactData.emails) {
        this.contactData.emails = [];
      }
      this.contactData.emails.push(this.newEmail);
      this.newEmail = '';

      this.contactInfoEdited.emit(this.contactData);
    }
  }

  addLink() {
    if (!!this.newLink) {
      if (!this.contactData.links) {
        this.contactData.links = [];
      }
      this.contactData.links.push(this.newLink);
      this.newLink = '';

      this.contactInfoEdited.emit(this.contactData);
    }
  }

  searchCompany() {
    this.crmGroupService.searchCRMCompanies((this.contactData._group._id || this.contactData._group), this.companySearchText).then(res => {
        this.companySearchResults = res['companies'];
      });
  }

  selectCompany(company: any) {
    this.contactData._company = company;
    this.companySearchText = '';
  }
}
