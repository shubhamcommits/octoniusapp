import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoungeRoutingModule } from './lounge-routing.module';

import { SharedModule } from 'src/app/common/shared/shared.module';

import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { LoungeComponent } from './lounge/lounge.component';
import { LoungeNewElementComponent } from './lounge/lounge-new-element/lounge-new-element.component';
import { EditLoungeComponent } from './lounge/edit-lounge/edit-lounge.component';
import { FormsModule } from '@angular/forms';
import { LoungeDetailsComponent } from './lounge-details/lounge-details.component';
import { LoungeImageUpdateComponent } from './lounge-image-update/lounge-image-update.component';
import { StoryDetailsComponent } from './story-details/story-details.component';
import { StoryActionsBarComponent } from './story-details/story-actions-bar/story-actions-bar.component';
import { LikeStoryComponent } from './story-details/like-story/like-story.component';
import { FollowStoryComponent } from './story-details/follow-story/follow-story.component';

@NgModule({
  declarations: [
    LoungeComponent,
    LoungeNewElementComponent,
    EditLoungeComponent,
    LoungeDetailsComponent,
    StoryDetailsComponent,
    StoryActionsBarComponent,
    LoungeImageUpdateComponent,
    LikeStoryComponent,
    FollowStoryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    LoungeRoutingModule,
    MatSelectModule,
    FormsModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class LoungeModule { }
