import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectGoogleCloudComponent } from './connect-google-cloud/connect-google-cloud.component';


@NgModule({
  declarations: [ConnectGoogleCloudComponent],
  imports: [
    CommonModule
  ],
  exports: [
    ConnectGoogleCloudComponent
  ]
})
export class GoogleCloudModule { }
