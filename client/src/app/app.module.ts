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
import { NgModule, ErrorHandler, Injectable } from '@angular/core';
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
import { Socket, SocketIoModule } from 'ngx-socket-io';
// import { ChartsModule, ThemeService } from 'ng2-charts';

/**
 * 7. !===== ERROR HANDLERS =====!
 */
import { ngxUiLoaderConfig } from 'src/assets/config/ngx-ui-loader.config';
import { socketConfig } from 'src/assets/config/socket.config';



/**
 * 8. !===== CONFIG VARIABLES =====!
 */
import { GlobalErrorHandler } from 'src/shared/error-handler/global-error-handler';
import { ServerErrorInterceptor } from 'src/shared/error-handler/server-error.interceptor';

// Injectable Class
@Injectable()
export class SocketServer extends Socket {
 
    constructor() {
        super(socketConfig);
    }
 
}

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

    // SOCKET MODULE AND INITIALISATION
    SocketIoModule,
  ],

  providers: [
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

    // Socket Server Class
    SocketServer
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
