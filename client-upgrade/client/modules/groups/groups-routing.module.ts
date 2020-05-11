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
import { GroupKanbanBoardsComponent } from './group/group-kanban-boards/group-kanban-boards.component';
// import { GroupFilesComponent } from './group/group-files/group-files.component';
import { GroupMembersComponent } from './group/group-members/group-members.component';
import { GroupPostComponent } from './group/group-post/group-post.component';


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
      {
        path: 'files',
        loadChildren: () => import('modules/files/files.module')
          .then((module) => module.FilesModule),
      },

      // Group Calendar
      {
        path: 'calendar',
        loadChildren: () => import('modules/calendar/calendar.module')
          .then((module) => module.CalendarModule),
      },

      // Group Members
      { path: 'members', component: GroupMembersComponent },

      // Group Admin
      { path: 'admin', component: GroupAdminComponent },

      // Group Post View
      { path: 'post/:postId', component: GroupPostComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule { }
