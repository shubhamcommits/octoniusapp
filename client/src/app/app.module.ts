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
import { AppComponent } from "./app.component";
import { PageNotFoundComponent } from "./common/page-not-found/page-not-found.component";

/**
 * 2. !===== MODULES =====!
 */

// CUSTOM MODULES
import { DashboardModule } from "./dashboard/dashboard.module";
// import { SharedModule } from './common/shared/shared.module';

// ANGULAR MODULES
import { AppRoutingModule } from "./app-routing.module";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule, ErrorHandler } from "@angular/core";
import { PathLocationStrategy, LocationStrategy } from "@angular/common";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSidenavModule } from "@angular/material/sidenav";

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

/**
 * 7. !===== ERROR HANDLERS =====!
 */

/**
 * 8. !===== CONFIG VARIABLES =====!
 */
import { GlobalErrorHandler } from "src/shared/error-handler/global-error-handler";
import { ServerErrorInterceptor } from "src/shared/error-handler/server-error.interceptor";
import { HttpCancelService } from "src/shared/services/httpcancel-service/httpcancel.service";
import { ManageHttpInterceptor } from "src/shared/services/manage-http-interceptor-service/manage-http-interceptor.service";

/**
 * Active Directory
 */
import { MsalModule } from "@azure/msal-angular";
import { PublicClientApplication } from "@azure/msal-browser";
import { environment } from "src/environments/environment";
import { ChatModule } from "modules/chat/chat.module";

const isIE =
  window.navigator.userAgent.indexOf("MSIE ") > -1 ||
  window.navigator.userAgent.indexOf("Trident/") > -1;

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

    MatSidenavModule,

    ChatModule,

    // SSO Active Directory

    MsalModule.forRoot(
      new PublicClientApplication({
        auth: {
          clientId: "",
          authority: "",
          redirectUri: environment.clientUrl,
        },
        cache: {
          cacheLocation: "localStorage",
          storeAuthStateInCookie: isIE, // Set to true for Internet Explorer 11
        },
      }),
      null,
      null
    ),
  ],

  providers: [
    HttpCancelService,
    // HASH LOCATION STRATEGY
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },
    // ERROR HANDLERS
    // {
    //   provide: ErrorHandler,
    //   useClass: GlobalErrorHandler,
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ManageHttpInterceptor,
      multi: true,
    },
    //{ provide: LOCALE_ID, useValue: getCurentLocale() }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function getCurentLocale(): string {
  return localStorage.getItem("locale") || "en";
}
