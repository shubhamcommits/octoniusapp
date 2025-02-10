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
    _workspace: null
  };

  enableSave = false;

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

    this.setEnableSave();
  }

  onProductInfoEdited(newProductDetails: any) {
    this.productData = newProductDetails;

    this.setEnableSave();
  }

  onProductImageEdited(newProductImage: any) {
    this.imageToUpload = newProductImage;

    this.setEnableSave();
  }

  saveProduct() {
    if (this.enableSave) {
      this.utilityService.asyncNotification($localize`:@@newCRMProductDialogComponent.pleaseWaitWeSave:Please wait we are saving the product...`, new Promise((resolve, reject) => {
        if (!!this.productData._id) {
          this.crmService.updateCRMProduct(this.productData).then(res => {
            this.productData = res['product'];
            this.productEdited.emit(this.productData);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@newCRMProductDialogComponent.productUpdated:Product updated!`));
            this.mdDialogRef.close();
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@newCRMProductDialogComponent.unableToUpdateProduct:Unable to update product, please try again!`));
          });
        } else {
          this.crmService.createCRMProduct(this.productData).then(res => {
            this.productData = res['product'];
            this.productCreated.emit(this.productData);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@newCRMProductDialogComponent.productCreated:Product created!`));
            this.mdDialogRef.close();
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@newCRMProductDialogComponent.unableToCreated:Unable to create product, please try again!`));
          });
        }
      }));
    }
    if (this.enableSave) {
      if (!!this.productData?._id) {
        this.crmService.updateCRMProduct(this.productData).then(res => {
          this.productData = res['product'];
          this.productEdited.emit(this.productData);
          this.mdDialogRef.close();
        });
      } else {
        this.crmService.createCRMProduct(this.productData).then(res => {
          this.productData = res['product'];
          this.productCreated.emit(this.productData);
          this.mdDialogRef.close();
        });
      }
    }
  }

  /**
    * This function opens up the content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
  async openUploadImageDetails(content) {
   this.utilityService.openModal(content, {});
  }

  setEnableSave() {
    this.enableSave = (!!this.productData && !!this.productData?.name && !!this.productData?._workspace);
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
