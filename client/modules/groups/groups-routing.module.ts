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
import { GroupGuard } from 'src/shared/guards/group-guard/group.guard';
import { GroupDashboardComponent } from './group/group-dashboard/group-dashboard.component';
import { GroupReportsComponent } from './group/group-reports/group-reports.component';
import { GroupsComponent } from './groups.component';
import { PortfolioGuard } from 'src/shared/guards/portfolio-guard/portfolio.guard';
import { PortfolioDetailsComponent } from './portfolio/portfolio-details/portfolio-details.component';
import { LibraryGuard } from 'src/shared/guards/library-guard/library.guard';
import { IndivicualSubscriptionGuard } from 'src/shared/guards/indivicual-subscription-guard/indivicual-subscription.guard';
import { GroupResourceManagementComponent } from './group/group-resource-management/group-resource-management.component';
import { GroupTasksViewsComponent } from './group/group-tasks-views/group-tasks-views.component';
import { GroupPageGuard } from 'src/shared/guards/group-page-guard/group-page.guard';
import { ResourceGuard } from 'src/shared/guards/resource-guard/resource.guard';


/**
 * ROUTES
 */
const routes: Routes = [

  // All Groups List Route
  { path: 'all', component: GroupsComponent, canActivate: [IndivicualSubscriptionGuard] },
  { path: 'portfolio', component: PortfolioDetailsComponent, canActivate: [PortfolioGuard] },
  // Group Specific Route
  {
    path: '', component: GroupComponent, children: [

      // Group Activity
      { path: 'activity', component: GroupActivityComponent, canActivate: [GroupPageGuard] },

      // Group Resource Management
      { path: 'resource', component: GroupResourceManagementComponent, canActivate: [ResourceGuard, GroupPageGuard] },

      // Group tasks
      { path: 'tasks', component: GroupTasksViewsComponent, canActivate: [GroupPageGuard] },

      // // Group CRM Contacts
      // {
      //   path: 'crm', 
      //   component: GroupCRMSetupViewComponent,
      //   canActivate: [CRMGuard, GroupPageGuard]
      // },

      // Group Files
      {
        path: 'files',
        loadChildren: () => import('modules/files/files.module')
          .then((module) => module.FilesModule),
        data: {
          preload: false
        },
        canActivate: [GroupPageGuard]
      },

      // Group Library
      {
        path: 'library',
        loadChildren: () => import('modules/library/library.module')
          .then((module) => module.LibraryModule),
        data: {
          preload: false
        },
        canActivate: [GroupPageGuard],
        canActivateChild: [LibraryGuard]
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
      { path: 'dashboard', component: GroupDashboardComponent, canActivate: [GroupPageGuard] },

      // Group Reports
      { path: 'reports', component: GroupReportsComponent, canActivate: [GroupPageGuard] }
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
