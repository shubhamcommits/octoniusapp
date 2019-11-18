import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyspaceRoutingModule } from './myspace-routing.module';
import { MyspaceInboxComponent } from './myspace-inbox/myspace-inbox.component';
import { MyspaceTasksComponent } from './myspace-tasks/myspace-tasks.component';
import { MyspaceAgendaComponent } from './myspace-agenda/myspace-agenda.component';
import { MyspaceWorkplaceComponent } from './myspace-workplace/myspace-workplace.component';
import { MyspaceHeaderComponent } from './myspace-header/myspace-header.component';


@NgModule({
  declarations: [MyspaceInboxComponent, MyspaceTasksComponent, MyspaceAgendaComponent, MyspaceWorkplaceComponent, MyspaceHeaderComponent],
  imports: [
    CommonModule,
    MyspaceRoutingModule
  ]
})
export class MyspaceModule { }
