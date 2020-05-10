import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeAgoPipe } from 'time-ago-pipe';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { PushNotificationsComponent } from '../common/navbar/push-notifications/push-notifications.component';
import { UserService } from 'src/shared/services/user-service/user.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthorizationInterceptorService } from 'src/shared/services/authorization-interceptor-service/authorization-interceptor.service';
import { HotkeyModule } from 'angular2-hotkeys';
import { SearchHeaderComponent } from 'modules/search/search-header/search-header.component';
import { SearchModule } from 'modules/search/search.module';
import { SearchResultsComponent } from 'modules/search/search-results/search-results.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [NavbarComponent, PushNotificationsComponent, TimeAgoPipe, SearchHeaderComponent, SearchResultsComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HotkeyModule,
    FormsModule
  ],
  providers:[
    UserService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationInterceptorService, multi: true }
  ],
  entryComponents: [
    SearchHeaderComponent,
  ]
})
export class DashboardModule { }
