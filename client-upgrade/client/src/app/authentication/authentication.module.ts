import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { AuthenticationRoutingModule } from './authentication-routing.module';
import { SharedModule } from '../common/shared/shared.module';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AuthSignInComponent } from './auth-sign-in/auth-sign-in.component';

import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { AuthSignUpComponent } from './auth-sign-up/auth-sign-up.component';
import { AuthNewWorkplaceComponent } from './auth-new-workplace/auth-new-workplace.component';
import { AuthUserDetailsComponent } from './auth-user-details/auth-user-details.component';
import { AuthCommonLayoutComponent } from './auth-common-layout/auth-common-layout.component';


@NgModule({
  declarations: [
    ForgotPasswordComponent,
    AuthSignInComponent,
    AuthSignUpComponent,
    AuthNewWorkplaceComponent,
    AuthUserDetailsComponent,
    AuthCommonLayoutComponent,
  ],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    FormsModule,
    SharedModule
  ],
  providers:[AuthService, UtilityService, StorageService]
})
export class AuthenticationModule { }
