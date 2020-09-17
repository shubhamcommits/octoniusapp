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

/**
* 2. !===== ANGULAR MODULES =====!
*/
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// import {MatGridListModule} from '@angular/material/grid-list';

/**
* 3. !===== CUSTOM MODULES =====!
*/
import { MyspaceRoutingModule } from './myspace-routing.module';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { MatMenuModule } from '@angular/material';
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
    MyspaceWorkplaceComponent

  ],
  imports: [

    // Common Module
    CommonModule,

    // Myspace Routing Module
    MyspaceRoutingModule,

    // MomentModule,

    // Shared Module
    SharedModule,

    // MatGridListModule,

    MatMenuModule
  ]
})
export class MyspaceModule { }
