import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { BrandingPanelComponent } from './branding-panel/branding-panel.component';
import { LoadingSpinnerSmallComponent } from './loading-spinner-small/loading-spinner-small.component';

@NgModule({
  declarations: [
    BrandingPanelComponent,
    LoadingSpinnerSmallComponent,
    WelcomePageComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule
  ],
  exports: [
    BrandingPanelComponent
  ]
})
export class HomeModule { }
