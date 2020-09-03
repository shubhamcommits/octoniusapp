import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PulseComponent } from './pulse/pulse.component';
import { NorthStarPageComponent } from './north-star-page/north-star-page.component';

const routes: Routes = [

  // Groups List
  {
    path: 'groups',
    loadChildren: () => import('modules/groups/groups.module')
      .then((module) => module.GroupsModule),
    data: {
      preload: false,
      state: 'group'
    }
  },

  // North Star
  { path: 'northstar', component: NorthStarPageComponent },

  // Pulse Groups
  { path: 'pulse', component: PulseComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkRoutingModule { }
