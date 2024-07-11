/**
 * !===== MYSPACE MODULE OF OCTONIUS CLIENT =====!
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
 * 2. ANGULAR MODULES
 * 3. CUSTOM MODULES
 * 4. IMPORTS & DECLARATIONS
 */

/**
* 1. !===== COMPONENTS =====!
*/
import { MyspaceAgendaComponent } from './myspace-agenda/myspace-agenda.component';
import { MyspaceHeaderComponent } from './myspace-header/myspace-header.component';
import { MyspaceInboxComponent } from './myspace-inbox/myspace-inbox.component';
import { MyspaceTasksComponent } from './myspace-tasks/myspace-tasks.component';
import { MyspaceWorkplaceComponent } from './myspace-workplace/myspace-workplace.component';
import { RecentGroupsComponent } from './myspace-inbox/recent-groups/recent-groups.component';

/**
* 2. !===== ANGULAR MODULES =====!
*/
import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import {MatGridListModule} from '@angular/material/grid-list';

/**
* 3. !===== CUSTOM MODULES =====!
*/
import { MyspaceRoutingModule } from './myspace-routing.module';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { MatMenuModule } from '@angular/material/menu';
import { RecentActivityComponent } from './myspace-inbox/recent-activity/recent-activity.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { RecentStoriesComponent } from './myspace-inbox/recent-stories/recent-stories.component';
import { MyTasksListComponent } from './myspace-tasks/my-tasks-list/my-tasks-list.component';
import { TimesheetsComponent } from './myspace-tasks/timesheets/timesheets.component';
import { FormsModule } from '@angular/forms';
// import { MomentModule } from "ngx-moment";

/**
* 4. !===== IMPORTS & DECLARATIONS =====!
*/
@NgModule({
  declarations: [

    // Myspace Header Component
    MyspaceHeaderComponent,

    // Myspace Inbox Component
    MyspaceInboxComponent,

    // Myspace Tasks Component
    MyspaceTasksComponent,

    // Myspace Agenda Component
    MyspaceAgendaComponent,

    // Myspace Workplace Component
    MyspaceWorkplaceComponent,

    RecentGroupsComponent,
    RecentActivityComponent,
    RecentStoriesComponent,
    MyTasksListComponent,
    TimesheetsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    MatMenuModule,
    MatTabsModule,
    MatBadgeModule,
    MyspaceRoutingModule,
  ],
  exports: [
    TimesheetsComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class MyspaceModule { }
