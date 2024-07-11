import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectMS365CloudComponent } from './connect-ms-365-cloud/connect-ms-365-cloud.component';
import { MS365AccountDetailsComponent } from './ms-365-account-details/ms-365-account-details.component';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ConnectMS365CloudComponent,
    MS365AccountDetailsComponent
  ],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    FormsModule
  ],
  exports: [
    ConnectMS365CloudComponent,
    MS365AccountDetailsComponent
  ]
})
export class MS365CloudModule { }
