/**
 * !===== GROUPS MODULE OF OCTONIUS CLIENT =====!
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
 * 4. DECLARATIONS, IMPORTS, & PROVIDERS
 */

 /**
 * 1. !===== COMPONENTS =====!
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GroupsRoutingModule } from './groups-routing.module';
import { GroupsHeaderComponent } from './groups-header/groups-header.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { PulseComponent } from './pulse/pulse.component';
import { CreateGroupComponent } from './groups-list/create-group/create-group.component';
import { GroupComponent } from './group/group.component';
import { GroupHeaderComponent } from './group/group-header/group-header.component';
// import { GroupActivityComponent } from './group/group-activity/group-activity.component';
// import { GroupActivityFiltersComponent } from './group/group-activity/group-activity-filters/group-activity-filters.component';
// import { GroupActivityProgressComponent } from './group/group-activity/group-activity-progress/group-activity-progress.component';
// import { GroupAdminComponent } from './group/group-admin/group-admin.component';
// import { GroupSmartAdminComponent } from './group/group-smart-admin/group-smart-admin.component';
// import { GroupCalendarComponent } from './group/group-calendar/group-calendar.component';
// import { GroupEditComponent } from './group/group-edit/group-edit.component';
// import { GroupFilesComponent } from './group/group-files/group-files.component';
// import { GroupTasksComponent } from './group/group-tasks/group-tasks.component';
// import { GroupKanbanBoardsComponent } from './group/group-kanban-boards/group-kanban-boards.component';
// import { GroupKanbanTaskAssignmentComponent } from './group/group-kanban-boards/group-kanban-task-assignment/group-kanban-task-assignment.component';
// import { GroupKanbanTaskViewComponent } from './group/group-kanban-boards/group-kanban-task-view/group-kanban-task-view.component';
import { GroupMembersComponent } from './group/group-members/group-members.component';
// import { GroupPostComponent } from './group/group-post/group-post.component';



 /**
 * 2. !===== MODULES =====!
 */
import { SharedModule } from 'src/app/common/shared/shared.module';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MomentModule } from "ngx-moment";

 /**
 * 3. !===== SERVICES =====!
 */
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { GroupAdminComponent } from './group/group-admin/group-admin.component';
import { GroupCalendarComponent } from './group/group-calendar/group-calendar.component';
import { GroupActivityComponent } from './group/group-activity/group-activity.component';
import { DeleteGroupComponent } from './group/group-admin/delete-group/delete-group.component';
import { PostService } from 'src/shared/services/post-service/post.service';
import { GroupKanbanBoardsComponent } from './group/group-kanban-boards/group-kanban-boards.component';
import { CreateColumnComponent } from './group/group-kanban-boards/create-column/create-column.component';
import { BoardBarComponent } from './group/group-kanban-boards/board-bar/board-bar.component';
import { NewTaskComponent } from './group/group-kanban-boards/new-task/new-task.component';
import { EditColumnComponent } from './group/group-kanban-boards/edit-column/edit-column.component';

 
/**
 * 4. !===== DECLARATIONS, IMPORTS, EXPORTS, & PROVIDERS =====!
 */
@NgModule({
  declarations: [
    
    // Groups Header Component
    GroupsHeaderComponent, 

    // Groups List Component
    GroupsListComponent, 

    // Pulse Component
    PulseComponent, 

    // Create Group Component
    CreateGroupComponent,

    // // Group Kanban Task View Component
    // GroupKanbanTaskViewComponent,

    // // Group Kanban Task Assignment Component
    // GroupKanbanTaskAssignmentComponent,

    // // Group Tasks Component
    // GroupTasksComponent,

    // // Group Smart Admin Component
    // GroupSmartAdminComponent,

    // // Group Post Component
    // GroupPostComponent,

    // Group Members Component
    GroupMembersComponent,

    // // Group Kanban Boards Component
    // GroupKanbanBoardsComponent,

    // // Group Files Component
    // GroupFilesComponent,

    // // Group Edit Component
    // GroupEditComponent,

    // // Group Calendar Component
    // GroupCalendarComponent,

    // // Group Admin Component
    // GroupAdminComponent,

    // // Group Activity Progress Component
    // GroupActivityProgressComponent,

    // // Group Activity Filters Component
    // GroupActivityFiltersComponent,

    // // Group Activity Component
    // GroupActivityComponent,
  
    // Group Component
    GroupComponent,

    GroupHeaderComponent,

    GroupAdminComponent,

    GroupCalendarComponent,

    GroupActivityComponent,

    DeleteGroupComponent,

    GroupKanbanBoardsComponent,

    CreateColumnComponent,

    BoardBarComponent,

    NewTaskComponent,

    EditColumnComponent
  ],
  imports: [
    CommonModule,
    GroupsRoutingModule,
    SharedModule,

    // FORMS MODULE
    FormsModule,

    DragDropModule,

    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),

    MomentModule
  ],
  providers: [
    GroupsService,
    GroupService,
    PostService
  ]
})
export class GroupsModule { }