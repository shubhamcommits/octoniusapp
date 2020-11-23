import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListWorkspacesPageComponent } from './list-workspaces-page/list-workspaces-page.component';

const routes: Routes = [
  { path: 'list', component: ListWorkspacesPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
