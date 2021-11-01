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
import { GroupsListComponent } from './groups-list/groups-list.component';
import { CreateGroupComponent } from './groups-list/create-group/create-group.component';
import { GroupComponent } from './group/group.component';
import { GroupMembersComponent } from './group/group-members/group-members.component';
import { GroupAdminComponent } from './group/group-admin/group-admin.component';
import { GroupActivityComponent } from './group/group-activity/group-activity.component';
import { DeleteGroupComponent } from './group/group-admin/delete-group/delete-group.component';
import { GroupKanbanBoardsComponent } from './group/group-kanban-boards/group-kanban-boards.component';
import { CreateColumnComponent } from './group/group-kanban-boards/create-column/create-column.component';
import { BoardBarComponent } from './group/group-kanban-boards/board-bar/board-bar.component';
import { EditColumnComponent } from './group/group-kanban-boards/edit-column/edit-column.component';
import { GroupPostComponent } from './group/group-post/group-post.component';
import { InviteUserComponent } from './group/group-admin/invite-user/invite-user.component';
import { GroupTasksViewsComponent } from './group/group-tasks-views/group-tasks-views.component';
import { GroupTasksListViewComponent } from './group/group-tasks-list-view/group-tasks-list-view.component';
import { CustomFieldsDialogComponent } from './group/custom-fields-dialog/custom-fields-dialog.component';
import { GroupSmartAdminComponent } from './group/group-admin/group-smart-admin/group-smart-admin.component';
import { CreateSectionComponent } from './group/group-tasks-list-view/create-section/create-section.component';
import { DoneTasksListViewComponent } from './group/group-tasks-list-view/done-tasks-list-view/done-tasks-list-view.component';
import { DoneTasksKanbanViewComponent } from './group/group-kanban-boards/done-tasks-kanban-view/done-tasks-kanban-view.component';
import { GroupRAGDialogComponent } from './group/group-admin/group-rag-dialog/group-rag-dialog.component';
import { GanttViewComponent } from './group/gantt-view/gantt-view.component';

 /**
  * 2. !===== MODULES =====!
  */
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GroupsRoutingModule } from './groups-routing.module';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { ResizableModule } from 'angular-resizable-element';
import {DatePipe} from '@angular/common';
 /**
  * 3. !===== SERVICES =====!
  */
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { CommentService } from 'src/shared/services/comment-service/comment.service';
import { GroupDashboardComponent } from './group/group-dashboard/group-dashboard.component';
import { TasksTableComponent } from './group/group-tasks-list-view/tasks-table/tasks-table.component';
import { AutomationFlowsDialogComponent } from './group/automation-flows-dialog/automation-flows-dialog.component';
import { AutomationFlowDetailsDialogComponent } from './group/automation-flow-details-dialog/automation-flow-details-dialog.component';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import { GroupCalendarViewComponent } from './group/group-calendar-view/group-calendar-view.component';

import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarModule as Calendar, DateAdapter } from 'angular-calendar';
import { CreateProjectColumnDialogComponent } from './group/group-kanban-boards/create-project-column-dialog/create-project-column-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { KanbanTaskCardComponent } from './group/group-kanban-boards/kanban-task-card/kanban-task-card.component';
import { ColumnProjectSectionComponent } from './group/group-kanban-boards/column-project-section/column-project-section.component';
import { AdvancedFilterDialogComponent } from './group/group-kanban-boards/board-bar/advanced-filter-dialog/advanced-filter-dialog.component';
import { GroupReportsComponent } from './group/group-reports/group-reports.component';
import { ShowCustomFieldsColumnDialogComponent } from './group/group-kanban-boards/show-custom-fields-column-dialog/show-custom-fields-column-dialog.component';
import { GroupKanbanArchivedBoardsComponent } from './group/group-kanban-archived-boards/group-kanban-archived-boards.component';

/**
 * 4. !===== DECLARATIONS, IMPORTS, EXPORTS, & PROVIDERS =====!
 */
@NgModule({
  declarations: [
    GroupRAGDialogComponent,
    ColumnProjectSectionComponent,
    // Groups List Component
    GroupsListComponent,

    // Create Group Component
    CreateGroupComponent,

    // // Group Smart Admin Component
    GroupSmartAdminComponent,

    // Group Members Component
    GroupMembersComponent,

    // Group Component
    GroupComponent,

    // GroupHeaderComponent,

    GroupAdminComponent,

    GroupActivityComponent,

    DeleteGroupComponent,

    GroupKanbanBoardsComponent,
    GroupTasksListViewComponent,
    GroupKanbanArchivedBoardsComponent,

    CreateColumnComponent,
    CreateSectionComponent,

    BoardBarComponent,

    EditColumnComponent,

    GroupPostComponent,

    InviteUserComponent,

    GroupTasksViewsComponent,
    CustomFieldsDialogComponent,
    AdvancedFilterDialogComponent,
    DoneTasksListViewComponent,
    DoneTasksKanbanViewComponent,

    GroupDashboardComponent,

    TasksTableComponent,

    AutomationFlowsDialogComponent,
    AutomationFlowDetailsDialogComponent,

    GroupCalendarViewComponent,

    GanttViewComponent,
    CreateProjectColumnDialogComponent,
    ShowCustomFieldsColumnDialogComponent,
    KanbanTaskCardComponent,
    GroupReportsComponent,
  ],
  imports: [
    CommonModule,
    GroupsRoutingModule,
    SharedModule,
    // FORMS MODULE
    FormsModule,
    DragDropModule,
    // Angular Material Buttons
    MatButtonModule,
    // Angular Material Menu Module
    MatMenuModule,
    // MomentModule
    MatChipsModule,
    MatDialogModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTableModule,
    MatSortModule,
    MatDatepickerModule,
    ResizableModule,

    Calendar.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
  providers: [
    GroupsService,
    GroupService,
    PostService,
    CommentService,
    FlowService,
    DatePipe
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
    CustomFieldsDialogComponent,
    AdvancedFilterDialogComponent,
    AutomationFlowsDialogComponent,
    AutomationFlowDetailsDialogComponent,
    CreateProjectColumnDialogComponent,
    ShowCustomFieldsColumnDialogComponent,
    GroupRAGDialogComponent
  ]
})
export class GroupsModule { }
