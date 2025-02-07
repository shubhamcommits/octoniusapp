import { Component, EventEmitter, Injector, Input, OnChanges, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { CRMService } from 'src/shared/services/crm-service/crm.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

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
  indexPhone = -1;
  indexEmail = -1;
  indexLink = -1;

  companySearchResults = [];
  companySearchText = '';

  workspaceData;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private crmService: CRMService,
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

      if (this.indexPhone === -1) {
        this.contactData.phones.push(this.newPhone);
      } else {
        this.contactData.phones[this.indexPhone] = this.newPhone;
      }

      this.contactInfoEdited.emit(this.contactData);
      this.indexPhone = -1;
      this.newPhone = '';
    }
  }

  editPhone(index: number): void {
    this.indexPhone = index;
    this.newPhone = this.contactData.phones[index];
  }

  removePhone(index: number): void {
    if (this.contactData?.phones) {
      this.indexPhone = -1;
      this.newPhone = '';
      this.contactData.phones.splice(index, 1);
      this.contactInfoEdited.emit(this.contactData);
    }
  }

  addEmail() {
    if (!!this.newEmail) {
      if (!this.contactData.emails) {
        this.contactData.emails = [];
      }

      if (this.indexEmail === -1) {
        this.contactData.emails.push(this.newEmail);
      } else {
        this.contactData.emails[this.indexEmail] = this.newEmail;
      }

      this.contactInfoEdited.emit(this.contactData);
      this.indexEmail = -1;
      this.newEmail = '';
    }
  }

  editEmail(index: number): void {
    this.indexEmail = index;
    this.newEmail = this.contactData.emails[index]
  }

  removeEmail(index: number): void {
    if (this.contactData?.emails) {
      this.indexEmail = -1;
      this.newEmail = '';
      this.contactData.emails.splice(index, 1);
      this.contactInfoEdited.emit(this.contactData);
    }
  }

  addLink() {
    if (!!this.newLink) {
      if (!this.contactData.links) {
        this.contactData.links = [];
      }

      if (this.indexLink === -1) {
        this.contactData.links.push(this.newLink);
      } else {
        this.contactData.links[this.indexLink] = this.newLink;
      }

      this.contactInfoEdited.emit(this.contactData);
      this.indexLink = -1;
      this.newLink = '';
    }
  }

  editLink(index: number): void {
    this.indexLink = index;
    this.newLink = this.contactData.links[index];
  }

  removeLink(index: number): void {
    if (this.contactData?.links) {
      this.indexLink = -1;
      this.newLink = '';
      this.contactData.links.splice(index, 1);
      this.contactInfoEdited.emit(this.contactData);
    }
  }

  searchCompany() {
    this.crmService.searchCRMCompanies(this.companySearchText).then(res => {
      this.companySearchResults = res['companies'];
    });
  }

  selectCompany(company: any) {
    this.contactData._company = company;
    this.companySearchText = '';

    this.contactInfoEdited.emit(this.contactData);
  }
}
