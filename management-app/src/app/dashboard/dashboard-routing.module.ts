import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';

const routes: Routes = [
  {
    path: '', component: NavbarComponent, children: [
      {
        path: 'workspace',
        loadChildren: () => import('src/app/workspace/workspace.module')
          .then((module) => module.WorkspaceModule),
          data: {
            preload: false
          }
      }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  providers: []
})
export class DashboardRoutingModule { }
