import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { CRMService } from 'src/shared/services/crm-service/crm.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-new-crm-product-dialog',
  templateUrl: './new-crm-product-dialog.component.html',
  styleUrls: ['./new-crm-product-dialog.component.scss']
})
export class NewCRMProductDialogComponent implements OnInit {

  @Output() productCreated = new EventEmitter();
  @Output() productEdited = new EventEmitter();

  productData: any = {
    name: '',
    description: '',
    _group: null
  };

  imageToUpload: File;

  workspaceData: any;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private crmService: CRMService,
    private mdDialogRef: MatDialogRef<NewCRMProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.utilityService.objectExists(this.workspaceData)) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    this.productData._workspace = this.workspaceData;

    if (!!this.data && !!this.data.productId) {
      await this.crmService.getCRMProduct(this.data.productId).then(res => {
        this.productData = res['product'];
      });
    }
  }

  onProductInfoEdited(newProductDetails: any) {
    this.productData = newProductDetails;
  }

  onProductImageEdited(newProductImage: any) {
    this.imageToUpload = newProductImage;
  }

  saveProduct() {
    if (!!this.productData?._id) {
      this.crmService.updateCRMProduct(this.productData).then(res => {
        this.productData = res['product'];
        this.productEdited.emit(this.productData);
      });
    } else {
      this.crmService.createCRMProduct(this.productData).then(res => {
        this.productData = res['product'];
        this.productCreated.emit(this.productData);
      });
    }

    this.mdDialogRef.close();
  }

  /**
    * This function opens up the content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
  async openUploadImageDetails(content) {
   this.utilityService.openModal(content, {});
  }

  closeDialog() {
    this.utilityService.getConfirmDialogAlert($localize`:@@newCRMProductDialog.areYouSure:Are you sure?`, $localize`:@@newCRMProductDialog.loseData:By doing this, you will lose all the information added in the product!`)
      .then((res) => {
        if (res.value) {
          this.mdDialogRef.close();
        }
      });
  }
}
