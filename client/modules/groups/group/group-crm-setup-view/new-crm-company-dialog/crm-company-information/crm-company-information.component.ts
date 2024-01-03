import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-crm-company-information',
  templateUrl: './crm-company-information.component.html',
  styleUrls: ['./crm-company-information.component.scss']
})
export class CRMCompanyInformationComponent implements OnChanges {

  @Input() companyData;

  @Output() companyInfoEdited = new EventEmitter();

  newName = '';
  newDescription = '';

  constructor(
  ) { }

  ngOnChanges(): void {
    if (!!this.companyData) {
      this.newName = this.companyData.name;
      this.newDescription = this.companyData.description;
    }
  }

  fieldEdited(propertyName: string) {
    switch (propertyName) {
      case 'name':
        this.companyData[propertyName] = this.newName;
        break;
      case 'description':
        this.companyData[propertyName] = this.newDescription;
        break;
    }

    this.companyInfoEdited.emit(this.companyData);
  }
}
