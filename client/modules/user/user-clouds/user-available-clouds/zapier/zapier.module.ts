import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZapAuthConfirmationComponent } from './zap-auth-confirmation/zap-auth-confirmation.component'

@NgModule({
  declarations: [ ZapAuthConfirmationComponent ],
  imports: [
    CommonModule
  ],
  exports: [
    ZapAuthConfirmationComponent
  ]
})
export class ZapModule { }
