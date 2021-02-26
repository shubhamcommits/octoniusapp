/**
 * !===== AUTHENTICATION MODULE OF OCTONIUS CLIENT =====!
 *
 * Please read the points below, before importing and injecting any dependencies:-
 * 1. Make sure that you document your import and if it's a part of exisiting module then import
 * that under the particular section, otherwise make a new suitable one.
 * 2. Insert the entries under the section in lexographical order.
 */

/**
 * !===== INDEX =====!
 *
 * 1. COMPONENTS
 * 2. MODULES
 * 3. SERVICES
 * 4. DECLARATIONS, IMPORTS, & PROVIDERS
 */

 /**
 * 1. !===== COMPONENTS =====!
 */
import { AuthCommonLayoutComponent } from './auth-common-layout/auth-common-layout.component';
import { AuthNewWorkplaceComponent } from './auth-new-workplace/auth-new-workplace.component';
import { AuthSignInComponent } from './auth-sign-in/auth-sign-in.component';
import { AuthSignUpComponent } from './auth-sign-up/auth-sign-up.component';
import { AuthUserDetailsComponent } from './auth-user-details/auth-user-details.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';



/**
 * 2. !===== MODULES =====!
 */

// ANGULAR MODULES
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// CUSTOM MODULES
import { HomeModule } from 'modules/home/home.module';
import { SharedModule } from 'src/app/common/shared/shared.module';



/**
 * 3. !===== SERVICES =====!
 */
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SelectWorkspaceComponent } from './select-workspace/select-workspace.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthJoinWorkplaceComponent } from './auth-join-workplace/auth-join-workplace.component';



/**
 * 4. !===== DECLARATIONS, IMPORTS, EXPORTS, & PROVIDERS =====!
 */
@NgModule({
  declarations: [
    // AUTH COMMON LAYOUT COMPONENT
    AuthCommonLayoutComponent,

    // AUTH NEW WORKPLACE COMPONENT
    AuthNewWorkplaceComponent,

    // AUTH JOIN WORKPLACE COMPONENT
    AuthJoinWorkplaceComponent,

    // AUTH SIGNIN COMPONENT
    AuthSignInComponent,

    // AUTH SIGNUP COMPONENT
    AuthSignUpComponent,

    // AUTH USER DETAILS COMPONENT
    AuthUserDetailsComponent,

    // FORGOT PASSWORD COMPONENT
    ForgotPasswordComponent,

    SelectWorkspaceComponent,

    ResetPasswordComponent
  ],
  imports: [
    // AUTHENTICATION ROUTING MODULE
    AuthenticationRoutingModule,

    // COMMON MODULE
    CommonModule,

    // FORMS MODULE
    FormsModule,

    // HOME MODULE
    HomeModule,

    // SHARED MODULE
    SharedModule
  ],
  providers:[
    // AUTHENTICATION SERVICE
    AuthService,

    // UTILITY SERVICE
    UtilityService,

    // STORAGE SERVICE
    StorageService
  ]
})
export class AuthenticationModule { }
