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
import { WelcomePageComponent } from './common/welcome-page/welcome-page.component';



/**
 * 2. !===== MODULES =====!
 */

// CUSTOM MODULES
import { AuthenticationModule } from './authentication/authentication.module';
import { DashboardModule } from './dashboard/dashboard.module';

// ANGULAR MODULES
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';



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
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SocketIoModule } from 'ngx-socket-io';



/**
 * 7. !===== ERROR HANDLERS =====!
 */
import { socketConfig } from 'src/shared/config/socket.config';



/**
 * 8. !===== CONFIG VARIABLES =====!
 */
import { GlobalErrorHandler } from 'src/shared/error-handler/global-error-handler';
import { ServerErrorInterceptor } from 'src/shared/error-handler/server-error.interceptor';



/**
 * 9. !===== DECLARATIONS, IMPORTS, & PROVIDERS =====!
 */
@NgModule({

  declarations: [
    // APP COMPONENT 
    AppComponent,

    // PAGE NOT FOUND COMPONENT
    PageNotFoundComponent,

    // WELCOME PAGE COMPONENT
    WelcomePageComponent
  ],

  imports: [
    // BROWSER MODULE
    BrowserModule,

    // APP ROUTING MODULE
    AppRoutingModule,
    
    // AUTHENTICATION MODULE
    AuthenticationModule,

    // DASHBOARD MODULE
    DashboardModule,

    // HTTP CLIENT MODULE
    HttpClientModule,

    // SNOTIFY MODULE
    SnotifyModule,
    
    // ANGULAR BOOTSTRAP MODAL MODULE
    NgbModalModule,

    // SOCKET MODULE AND INITIALISATION
    SocketIoModule.forRoot(socketConfig)
  ],

  providers: [

    // SNOTIFY SERVICE AND CONFIG
    SnotifyService,
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults },

    // HASH LOCATION STRATEGY
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  
    // ERROR HANDLERS
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: ServerErrorInterceptor, multi: true }],

  bootstrap: [AppComponent]
})
export class AppModule { }
