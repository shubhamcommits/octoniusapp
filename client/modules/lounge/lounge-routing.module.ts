import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from 'src/shared/guards/admin-guard/admin.guard';
import { StoryGuard } from 'src/shared/guards/story-guard/story.guard';
import { LoungeDetailsComponent } from './lounge-details/lounge-details.component';
import { LoungeComponent } from './lounge/lounge.component';
import { StoryDetailsComponent } from './story-details/story-details.component';

const routes: Routes = [

  // Lounge
  { path: '', component: LoungeComponent },

  // Lounge Details
  { path: 'details', component: LoungeDetailsComponent },

  // Story Details
  { path: 'story', component: StoryDetailsComponent, canActivate: [StoryGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    AdminGuard,
    StoryGuard
  ]
})
export class LoungeRoutingModule { }
