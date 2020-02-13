import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupsHeaderComponent } from './groups-header/groups-header.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { PulseComponent } from './pulse/pulse.component';


const routes: Routes = [
  {
    path: '', component: GroupsHeaderComponent, children: [
      { path: 'all', component: GroupsListComponent },
      { path: 'pulse', component: PulseComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule { }
