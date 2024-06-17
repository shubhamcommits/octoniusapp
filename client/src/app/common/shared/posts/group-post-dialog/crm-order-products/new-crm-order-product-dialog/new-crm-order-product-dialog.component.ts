import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-new-crm-order-product-dialog',
  templateUrl: './new-crm-order-product-dialog.component.html',
  styleUrls: ['./new-crm-order-product-dialog.component.scss']
})
export class NewCRMOrderProductDialogComponent implements OnInit {

  @Output() orderCreated = new EventEmitter();
  @Output() orderEdited = new EventEmitter();

  orderData: any = {
    _product: null,
    quantity: 1
  };
  postId: string;

  postData: any;
  groupData: any;

  productSearchResults = [];
  productSearchText = '';

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private postService: PostService,
    private crmGroupService: CRMGroupService,
    private mdDialogRef: MatDialogRef<NewCRMOrderProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector
  ) {}

  async ngOnInit(): Promise<void> {

    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    if (!!this.data && !!this.data.postId) {
      this.postId = this.data.postId
      await this.postService.get(this.postId).then(res => {
        this.postData = res['post'];
      });
    }

    if (!!this.data && !!this.data.orderData) {
      this.orderData = this.data.orderData;
    }
  }

  saveOrder() {
    if (!!this.orderData?._id) {
      this.crmGroupService.updateCRMOrder(this.postId, this.orderData).then(res => {
        // this.orderData = res['order'];
        this.orderEdited.emit(this.orderData);
      });
    } else {
      this.crmGroupService.createCRMOrder(this.postId, this.orderData).then(res => {
        this.orderCreated.emit(res['post']);
      });
    }

    this.mdDialogRef.close();
  }

  searchProduct() {
    this.crmGroupService.searchCRMProducts(this.groupData._id, this.productSearchText).then(res => {
        this.productSearchResults = res['products'];
      });
  }

  async selectProduct(product: any) {
    if (!this.orderData) {
      this.orderData = {};
    }

    this.orderData._product = product;

    if (!product) {
      this.orderData._contacts = [];
    }

    this.productSearchText = '';

    // this.updateCRM(this.postData?._id, this.postData?.crm);
  }

  closeDialog() {
    this.utilityService.getConfirmDialogAlert($localize`:@@newCRMOrderDialog.areYouSure:Are you sure?`, $localize`:@@newCRMOrderDialog.loseData:By doing this, you will lose all the information added in the order!`)
      .then((res) => {
        if (res.value) {
          this.mdDialogRef.close();
        }
      });
  }
}
