import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { BrandingPanelComponent } from './branding-panel/branding-panel.component';
import { LoadingSpinnerSmallComponent } from './loading-spinner-small/loading-spinner-small.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    BrandingPanelComponent,
    LoadingSpinnerSmallComponent,
    WelcomePageComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,

    // FORMS MODULE
    FormsModule
  ],
  exports: [
    BrandingPanelComponent
  ]
})
export class HomeModule { }
