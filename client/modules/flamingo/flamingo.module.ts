import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { FlamingoEditorComponent } from './flamingo-editor/flamingo-editor.component';
import { FlamingoHeaderComponent } from './flamingo-header/flamingo-header.component';
import { FlamingoRoutingModule } from './flamingo-routing.module';
import { FlamingoPreviewComponent } from './flamingo-preview/flamingo-preview.component';
import { FlamingoAnswerComponent } from './flamingo-answer/flamingo-answer.component';
import { QuestionImageDetailsComponent } from './flamingo-editor/question-image-details/question-image-details.component';
import { FlamingoPublishComponent } from './flamingo-publish/flamingo-publish.component';
import { FlamingoResultComponent } from './flamingo-result/flamingo-result.component';
import { ResultInsightsComponent } from './flamingo-result/result-insights/result-insights.component';
import { ResultResponsesComponent } from './flamingo-result/result-responses/result-responses.component';

@NgModule({
  declarations: [
    FlamingoEditorComponent,
    FlamingoHeaderComponent,
    FlamingoPreviewComponent,
    FlamingoAnswerComponent,
    QuestionImageDetailsComponent,
    FlamingoPublishComponent,
    FlamingoResultComponent,
    ResultInsightsComponent,
    ResultResponsesComponent
  ],
  imports: [
    CommonModule,
    NgbTooltipModule,
    FlamingoRoutingModule,
    MatMenuModule,
    FormsModule,
    SharedModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatTabsModule
  ]
})
export class FlamingoModule { }
