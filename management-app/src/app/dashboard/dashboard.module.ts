import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './navbar/sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    MatSidenavModule
  ],
  providers: [],
})
export class DashboardModule { }
