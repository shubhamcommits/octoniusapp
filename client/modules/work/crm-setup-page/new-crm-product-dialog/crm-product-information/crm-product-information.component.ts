import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-crm-product-information',
  templateUrl: './crm-product-information.component.html',
  styleUrls: ['./crm-product-information.component.scss']
})
export class CRMProductInformationComponent implements OnChanges {

  @Input() productData;

  @Output() productInfoEdited = new EventEmitter();

  newName = '';
  newDescription = '';

  constructor(
  ) { }

  ngOnChanges(): void {
    if (!!this.productData) {
      this.newName = this.productData.name;
      this.newDescription = this.productData.description;
    }
  }

  fieldEdited(propertyName: string) {
    switch (propertyName) {
      case 'name':
        this.productData[propertyName] = this.newName;
        break;
      case 'description':
        this.productData[propertyName] = this.newDescription;
        break;
    }

    this.productInfoEdited.emit(this.productData);
  }
}
