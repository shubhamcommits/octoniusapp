import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { MyspaceModule } from './myspace/myspace.module';
import { GroupsModule } from './groups/groups.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { PushNotificationsComponent } from '../common/navbar/push-notifications/push-notifications.component';


@NgModule({
  declarations: [NavbarComponent, PushNotificationsComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MyspaceModule,
    GroupsModule,
    AdminModule,
    UserModule
  ]
})
export class DashboardModule { }
