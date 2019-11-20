import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeAgoPipe } from 'time-ago-pipe';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { MyspaceModule } from './myspace/myspace.module';
import { GroupsModule } from './groups/groups.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { PushNotificationsComponent } from '../common/navbar/push-notifications/push-notifications.component';
import { UserService } from 'src/shared/services/user-service/user.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthorizationInterceptorService } from 'src/shared/services/authorization-interceptor-service/authorization-interceptor.service';


@NgModule({
  declarations: [NavbarComponent, PushNotificationsComponent, TimeAgoPipe],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MyspaceModule,
    GroupsModule,
    AdminModule,
    UserModule
  ],
  providers:[
    UserService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationInterceptorService, multi: true }
  ]
})
export class DashboardModule { }
