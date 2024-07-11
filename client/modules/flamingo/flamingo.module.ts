import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
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
import { ScaleResponsesGraphComponent } from './flamingo-result/result-insights/scale-responses-graph/scale-responses-graph.component';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

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
    ResultResponsesComponent,
    ScaleResponsesGraphComponent
  ],
  imports: [
    CommonModule,
    FlamingoRoutingModule,
    MatMenuModule,
    FormsModule,
    SharedModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatTabsModule,
    MatProgressBarModule,
    MatSelectModule
  ]
})
export class FlamingoModule { }
