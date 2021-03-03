import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { BrandingPanelComponent } from './branding-panel/branding-panel.component';
import { LoadingSpinnerSmallComponent } from './loading-spinner-small/loading-spinner-small.component';
import { FormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './welcome-page/forgot-password/forgot-password.component';
import { SharedModule } from 'src/app/common/shared/shared.module';

@NgModule({
  declarations: [
    BrandingPanelComponent,
    LoadingSpinnerSmallComponent,
    WelcomePageComponent,
    ForgotPasswordComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,

    // FORMS MODULE
    FormsModule,

    // SHARED MODULE
    SharedModule
  ],
  exports: [
    BrandingPanelComponent
  ]
})
export class HomeModule { }
