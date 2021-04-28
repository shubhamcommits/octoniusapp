import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { FlamingoEditorComponent } from './flamingo-editor/flamingo-editor.component';
import { FlamingoHeaderComponent } from './flamingo-header/flamingo-header.component';
import {FlamingoRoutingModule} from './flamingo-routing.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
import { FlamingoPreviewComponent } from './flamingo-preview/flamingo-preview.component';
import { FlamingoAnswerComponent } from './flamingo-answer/flamingo-answer.component';
import { QuestionImageDetailsComponent } from './flamingo-editor/question-image-details/question-image-details.component';
import { FlamingoPublishComponent } from './flamingo-publish/flamingo-publish.component';
@NgModule({
  declarations: [
    FlamingoEditorComponent,
    FlamingoHeaderComponent,
    FlamingoPreviewComponent,
    FlamingoAnswerComponent,
    QuestionImageDetailsComponent,
    FlamingoPublishComponent
  ],
  imports: [
    CommonModule,

    FlamingoRoutingModule,
    MatMenuModule,
    // Forms Module
    FormsModule,
    SharedModule,
    MatSlideToggleModule,
    MatSliderModule,
    // Tooltip Module
    NgbTooltipModule,
  ]
})
export class FlamingoModule { }
