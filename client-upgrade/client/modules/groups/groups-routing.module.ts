import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupsHeaderComponent } from './groups-header/groups-header.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { PulseComponent } from './pulse/pulse.component';
import { GroupComponent } from './group/group.component';
import { GroupActivityComponent } from './group/group-activity/group-activity.component';
import { GroupFilesComponent } from './group/group-files/group-files.component';
import { GroupCalendarComponent } from './group/group-calendar/group-calendar.component';
import { GroupMembersComponent } from './group/group-members/group-members.component';
import { GroupAdminComponent } from './group/group-admin/group-admin.component';
import { GroupPostComponent } from './group/group-post/group-post.component';
import { GroupTasksComponent } from './group/group-tasks/group-tasks.component';

const routes: Routes = [
  {
    path: '', component: GroupsHeaderComponent, children: [
      { path: 'all', component: GroupsListComponent },
      { path: 'pulse', component: PulseComponent },
      {
        path: ':id', component: GroupComponent, children: [
          // { path: 'activity', component: GroupActivityComponent },
          // { path: 'files', component: GroupFilesComponent },
          // { path: 'calendar', component: GroupCalendarComponent },
          // { path: 'members', component: GroupMembersComponent },
          // { path: 'admin', component: GroupAdminComponent },
          // { path: 'post/:postId', component: GroupPostComponent },
          // { path: 'tasks', component: GroupTasksComponent },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule { }
