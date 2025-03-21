import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectBoxCloudComponent } from './connect-box-cloud/connect-box-cloud.component';
import { BoxAccountDetailsComponent } from './box-account-details/box-account-details.component';



@NgModule({
  declarations: [
    ConnectBoxCloudComponent,
    BoxAccountDetailsComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ConnectBoxCloudComponent,
    BoxAccountDetailsComponent
  ]
})
export class BoxCloudModule { }
