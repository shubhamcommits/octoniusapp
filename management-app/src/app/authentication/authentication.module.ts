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
import { AuthSignInComponent } from './auth-sign-in/auth-sign-in.component';
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


/**
 * 3. !===== SERVICES =====!
 */
import { UtilityService } from '../shared/services/utility-service/utility.service';
import { StorageService } from '../shared/services/storage-service/storage.service';
import { AuthService } from '../shared/services/auth-service/auth.service';
import { HomeModule } from '../home/home.module';



/**
 * 4. !===== DECLARATIONS, IMPORTS, EXPORTS, & PROVIDERS =====!
 */
@NgModule({
  declarations: [
    // AUTH COMMON LAYOUT COMPONENT
    AuthCommonLayoutComponent,

    // AUTH SIGNIN COMPONENT
    AuthSignInComponent,

    // AUTH USER DETAILS COMPONENT
    AuthUserDetailsComponent,

    // FORGOT PASSWORD COMPONENT
    ForgotPasswordComponent,
  ],
  imports: [
    // AUTHENTICATION ROUTING MODULE
    AuthenticationRoutingModule,

    // COMMON MODULE
    CommonModule,

    // FORMS MODULE
    FormsModule,

    // HOME MODULE
    HomeModule
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
