import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

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

  constructor(
  ) { }

  ngOnChanges(): void {
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
}
