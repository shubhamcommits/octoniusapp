import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeAgoPipe } from 'time-ago-pipe';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { GroupNavbarComponent } from '../common/navbar/group-navbar/group-navbar.component';
import { CommonNavbarComponent } from '../common/navbar/common-navbar/common-navbar.component';
import { PushNotificationsComponent } from '../common/navbar/push-notifications/push-notifications.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthorizationInterceptorService } from 'src/shared/services/authorization-interceptor-service/authorization-interceptor.service';
// import { HotkeyModule } from 'angular2-hotkeys';
import { SearchModule } from 'modules/search/search.module';
import { FormsModule } from '@angular/forms';
import { WorkNavbarComponent } from '../common/navbar/work-navbar/work-navbar.component';
import { GroupImageDetailsComponent } from '../common/navbar/group-navbar/group-image-details/group-image-details.component';
import { SharedModule } from '../common/shared/shared.module';
import { SidebarComponent } from '../common/navbar/sidebar/sidebar.component';

@NgModule({
  declarations: [
    NavbarComponent,
    PushNotificationsComponent,
    TimeAgoPipe,
    GroupNavbarComponent,
    CommonNavbarComponent,
    WorkNavbarComponent,
    GroupImageDetailsComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    // HotkeyModule.forRoot(),
    SharedModule,
    FormsModule,
    SearchModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationInterceptorService, multi: true }
  ],
})
export class DashboardModule { }
