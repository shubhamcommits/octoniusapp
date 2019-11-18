/**
 * !===== APP MODULE OF OCTONIUS CLIENT =====!
 * 
 * Please read the points below, before importing and injecting any dependencies:-
 * 1. Make sure that you document your import and if it's a part of exisiting module then import that under that 
 * particular section, otherwise make a new suitable one.
 * 2. Insert the entries under the section in lexographical order.
 */

/**
 * !===== INDEX =====!
 * 
 * 1. COMPONENTS
 * 2. ANGULAR MODULES
 * 3. SERVICES
 * 4. GUARDS
 * 5. PIPES
 * 6. THIRD PARTY MODULES
 * 7. CONFIG VARIABLES
 * 7. DIRECTIVES
 * 9. IMPORTS & DECLARATIONS
 */

 /**
 * 1. !===== COMPONENTS =====!
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/**
 * 3. !===== SERVICES =====!
 */
// import { UtilityService } from 'src/shared/services/utility-service/utility.service';
// import { StorageService } from 'src/shared/services/storage-service/storage.service';
// import { UserService } from 'src/shared/services/user-service/user.service';


/**
 * 6. !===== THIRD PARTY MODULES =====!
 */
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SocketIoModule } from 'ngx-socket-io';

import { GlobalErrorHandler } from 'src/shared/error-handler/global-error-handler';
import { ServerErrorInterceptor } from 'src/shared/error-handler/server-error.interceptor';
import { socketConfig } from 'src/shared/config/socket.config';

import { AuthenticationModule } from './authentication/authentication.module';
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';
import { WelcomePageComponent } from './common/welcome-page/welcome-page.component';
import { DashboardModule } from './dashboard/dashboard.module';
// import { NavbarComponent } from './common/navbar/navbar.component';
// import { SearchBarComponent } from './common/navbar/search-bar/search-bar.component';


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    WelcomePageComponent,
    // NavbarComponent,
    // SearchBarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthenticationModule,
    DashboardModule,
    HttpClientModule,
    SnotifyModule,
    NgbModule,
    SocketIoModule.forRoot(socketConfig)
  ],
  providers: [
    // UtilityService,
    
    // StorageService,

    // UserService,

    SnotifyService,
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: ServerErrorInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
