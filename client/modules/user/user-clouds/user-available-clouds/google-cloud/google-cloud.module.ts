import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectGoogleCloudComponent } from './connect-google-cloud/connect-google-cloud.component';
import { GoogleAccountDetailsComponent } from './google-account-details/google-account-details.component';


@NgModule({
  declarations: [ConnectGoogleCloudComponent, GoogleAccountDetailsComponent],
  imports: [
    CommonModule
  ],
  exports: [
    ConnectGoogleCloudComponent,
    GoogleAccountDetailsComponent
  ]
})
export class GoogleCloudModule { }
