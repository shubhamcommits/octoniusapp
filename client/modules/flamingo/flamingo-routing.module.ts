import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FlamingoHeaderComponent } from './flamingo-header/flamingo-header.component';
import { FlamingoEditorComponent } from './flamingo-editor/flamingo-editor.component';
import { FlamingoPreviewComponent } from './flamingo-preview/flamingo-preview.component';
import { FlamingoPublishComponent } from './flamingo-publish/flamingo-publish.component';
import { FlamingoAnswerComponent } from './flamingo-answer/flamingo-answer.component';
import { FlamingoResultComponent } from './flamingo-result/flamingo-result.component';

const routes: Routes = [
  {
    path: '', component: FlamingoHeaderComponent, children: [
      {
        path: ':id', component: FlamingoEditorComponent
      },
      {
        path:':id/publish', component: FlamingoPublishComponent
      },
      {
        path:':id/result', component: FlamingoResultComponent
      }
    ]
  },
  {
    path:':id/preview', component: FlamingoPreviewComponent
  },
  {
    path:':id/answer', component: FlamingoAnswerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlamingoRoutingModule { }
