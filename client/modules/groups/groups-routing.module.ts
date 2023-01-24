import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/**
 * GROUPS COMPONENTS
 */
// import { GroupsListComponent } from './groups-list/groups-list.component';

/**
 * GROUP COMPONENTS
 */
import { GroupComponent } from './group/group.component';
import { GroupActivityComponent } from './group/group-activity/group-activity.component';
import { GroupAdminComponent } from './group/group-admin/group-admin.component';
import { GroupMembersComponent } from './group/group-members/group-members.component';
import { GroupTasksViewsComponent } from './group/group-tasks-views/group-tasks-views.component';
import { GroupGuard } from 'src/shared/guards/group-guard/group.guard';
import { GroupDashboardComponent } from './group/group-dashboard/group-dashboard.component';
import { GroupReportsComponent } from './group/group-reports/group-reports.component';
import { GroupsComponent } from './groups.component';
import { PortfolioGuard } from 'src/shared/guards/portfolio-guard/portfolio.guard';
import { PortfolioDetailsComponent } from './portfolio/portfolio-details/portfolio-details.component';


/**
 * ROUTES
 */
const routes: Routes = [

  // All Groups List Route
  { path: 'all', component: GroupsComponent },
  { path: 'portfolio', component: PortfolioDetailsComponent, canActivate: [PortfolioGuard] },
  // Group Specific Route
  {
    path: '', component: GroupComponent, children: [

      // Group Activity
      { path: 'activity', component: GroupActivityComponent },

      // Group Kanban/tasks
      { path: 'tasks', component: GroupTasksViewsComponent },

      // Group Files
      {
        path: 'files',
        loadChildren: () => import('modules/files/files.module')
          .then((module) => module.FilesModule),
        data: {
          preload: false
        }
      },

      // Group Library
      {
        path: 'library',
        loadChildren: () => import('modules/library/library.module')
          .then((module) => module.LibraryModule),
        data: {
          preload: false
        }
      },

      // Group Calendar
      {
        path: 'calendar',
        loadChildren: () => import('modules/calendar/calendar.module')
          .then((module) => module.CalendarModule),
        data: {
          preload: false
        }
      },

      // Group Members
      { path: 'members', component: GroupMembersComponent },

      // Group Admin
      { path: 'admin', component: GroupAdminComponent },

      // Group Dashboards
      { path: 'dashboard', component: GroupDashboardComponent },

      // Group Reports
      { path: 'reports', component: GroupReportsComponent }
    ],
    runGuardsAndResolvers: `always`,
    canActivate: [GroupGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule { }
