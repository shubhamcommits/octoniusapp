import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyspaceInboxComponent } from './myspace-inbox/myspace-inbox.component';
import { MyspaceTasksComponent } from './myspace-tasks/myspace-tasks.component';
import { MyspaceAgendaComponent } from './myspace-agenda/myspace-agenda.component';
import { MyspaceWorkplaceComponent } from './myspace-workplace/myspace-workplace.component';
import { MyspaceHeaderComponent } from './myspace-header/myspace-header.component';

const routes: Routes = [
  {
    path: '', component: MyspaceHeaderComponent, children: [
      { path: 'inbox', component: MyspaceInboxComponent },
      { path: 'tasks', component: MyspaceTasksComponent },
      { path: 'agenda', component: MyspaceAgendaComponent },
      { path: 'workplace', component: MyspaceWorkplaceComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyspaceRoutingModule { }
