import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListUsersPageComponent } from './list-users-page/list-users-page.component';
import { ListWorkspacesPageComponent } from './list-workspaces-page/list-workspaces-page.component';

const routes: Routes = [
  { path: 'list', component: ListWorkspacesPageComponent },
  { path: 'users', component: ListUsersPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
