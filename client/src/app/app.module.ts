/**
 * !===== APP MODULE OF OCTONIUS CLIENT =====!
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
 * 4. GUARDS
 * 5. PIPES
 * 6. THIRD PARTY MODULES & SERVICES
 * 7. CONFIG VARIABLES
 * 8. ERROR HANDLERS
 * 9. DECLARATIONS, IMPORTS, & PROVIDERS
 */

/**
* 1. !===== COMPONENTS =====!
*/
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';



/**
 * 2. !===== MODULES =====!
 */

// CUSTOM MODULES
import { DashboardModule } from './dashboard/dashboard.module';
// import { SharedModule } from './common/shared/shared.module';


// ANGULAR MODULES
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, Injectable, LOCALE_ID } from '@angular/core';
import { PathLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';

/**
 * 3. !===== SERVICES =====!
 */



/**
 * 4. !===== GUARDS =====!
 */



/**
 * 5. !===== PIPES =====!
 */


/**
 * 6. !===== THIRD PARTY MODULES & SERVICES =====!
 */
// import { NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
// import { ChartsModule, ThemeService } from 'ng2-charts';

/**
 * 7. !===== ERROR HANDLERS =====!
 */
import { ngxUiLoaderConfig } from 'src/assets/config/ngx-ui-loader.config';



/**
 * 8. !===== CONFIG VARIABLES =====!
 */
import { GlobalErrorHandler } from 'src/shared/error-handler/global-error-handler';
import { ServerErrorInterceptor } from 'src/shared/error-handler/server-error.interceptor';
import { HttpCancelService } from 'src/shared/services/httpcancel-service/httpcancel.service';
import { ManageHttpInterceptor } from 'src/shared/services/manage-http-interceptor-service/manage-http-interceptor.service';

/**
 * Active Directory
 */
import { MsalModule } from '@azure/msal-angular';
import { PublicClientApplication } from '@azure/msal-browser';
import { environment } from 'src/environments/environment';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

/**
 * 9. !===== DECLARATIONS, IMPORTS, EXPORTS, & PROVIDERS =====!
 */
@NgModule({

  declarations: [
    // APP COMPONENT
    AppComponent,

    // PAGE NOT FOUND COMPONENT
    PageNotFoundComponent,
  ],

  imports: [
    // BROWSER MODULE
    BrowserModule,

    // BROWSER ANIMATION MODULE
    BrowserAnimationsModule,

    // APP ROUTING MODULE
    AppRoutingModule,

    // DASHBOARD MODULE
    DashboardModule,

    // HTTP CLIENT MODULE
    HttpClientModule,

    // ChartsModule,

    // ANGULAR BOOTSTRAP MODAL MODULE
    // NgbModalModule,

    // ANGULAR TOOLTIP MODULE
    // NgbTooltipModule,

    // NGX UI LOADER MODULE
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    MatSidenavModule,
    // SHARED MODULES
    // SharedModule,

    // SSO Active Directory
    MsalModule.forRoot( new PublicClientApplication({
      auth: {
        //clientId: 'Enter_the_Application_Id_here', // This is your client ID
        //authority: 'Enter_the_Cloud_Instance_Id_Here'/'Enter_the_Tenant_Info_Here', // This is your tenant ID
        //redirectUri: 'Enter_the_Redirect_Uri_Here'// This is your redirect URI
        clientId: environment.active_directory_client_application_id,
        authority: environment.active_directory_authority_cloud_id,
        redirectUri: environment.active_directory_redirect_url
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: isIE, // Set to true for Internet Explorer 11
      }
    }), null, null)
  ],

  providers: [
    HttpCancelService,

    // HASH LOCATION STRATEGY
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    },

    // ERROR HANDLERS
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: ManageHttpInterceptor, multi: true },
    //{ provide: LOCALE_ID, useValue: 'en-US' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
