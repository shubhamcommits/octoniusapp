import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/**
 * GROUPS COMPONENTS
 */
import { GroupsHeaderComponent } from './groups-header/groups-header.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { PulseComponent } from './pulse/pulse.component';

/**
 * GROUP COMPONENTS
 */
import { GroupComponent } from './group/group.component';
import { GroupActivityComponent } from './group/group-activity/group-activity.component';
import { GroupAdminComponent } from './group/group-admin/group-admin.component';
import { GroupCalendarComponent } from './group/group-calendar/group-calendar.component';
import { GroupKanbanBoardsComponent } from './group/group-kanban-boards/group-kanban-boards.component';
// import { GroupFilesComponent } from './group/group-files/group-files.component';
import { GroupMembersComponent } from './group/group-members/group-members.component';
// import { GroupPostComponent } from './group/group-post/group-post.component';
// import { GroupTasksComponent } from './group/group-tasks/group-tasks.component';


/**
 * ROUTES
 */
const routes: Routes = [
  {
    path: '', component: GroupsHeaderComponent, children: [

      // Groups List
      { path: 'all', component: GroupsListComponent },

      // Pulse Groups
      { path: 'pulse', component: PulseComponent },
    ]
  },
  {
    path: ':id', component: GroupComponent, children: [

      // Group Activity
      { path: 'activity', component: GroupActivityComponent },

      // Group Kanban/tasks
      { path: 'tasks', component: GroupKanbanBoardsComponent },

      // Group Files
      // { path: 'files', component: GroupFilesComponent },

      // Group Calendar
      { path: 'calendar', component: GroupCalendarComponent },

      // Group Members
      { path: 'members', component: GroupMembersComponent },

      // Group Admin
      { path: 'admin', component: GroupAdminComponent },

      // Group Post View
      // { path: 'post/:postId', component: GroupPostComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule { }
