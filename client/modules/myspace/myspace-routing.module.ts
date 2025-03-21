import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyspaceInboxComponent } from './myspace-inbox/myspace-inbox.component';
import { MyspaceTasksComponent } from './myspace-tasks/myspace-tasks.component';
import { MyspaceAgendaComponent } from './myspace-agenda/myspace-agenda.component';
import { MyspaceWorkplaceComponent } from './myspace-workplace/myspace-workplace.component';
import { ActivateInboxGuard } from 'src/shared/guards/activate-inbox-guard/activate-inbox.guard';

const routes: Routes = [
  { path: 'inbox', component: MyspaceInboxComponent, canActivate: [ActivateInboxGuard] },
  { path: 'tasks', component: MyspaceTasksComponent },
  { path: 'agenda', component: MyspaceAgendaComponent },
  { path: 'workplace', component: MyspaceWorkplaceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyspaceRoutingModule { }
