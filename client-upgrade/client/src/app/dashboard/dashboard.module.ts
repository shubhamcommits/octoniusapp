import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeAgoPipe } from 'time-ago-pipe';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { PushNotificationsComponent } from '../common/navbar/push-notifications/push-notifications.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthorizationInterceptorService } from 'src/shared/services/authorization-interceptor-service/authorization-interceptor.service';
import { HotkeyModule } from 'angular2-hotkeys';
import { SearchModule } from 'modules/search/search.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [NavbarComponent, PushNotificationsComponent, TimeAgoPipe],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HotkeyModule.forRoot(),
    FormsModule,
    SearchModule
  ],
  providers:[
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationInterceptorService, multi: true }
  ],
})
export class DashboardModule { }
