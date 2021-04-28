import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FlamingoHeaderComponent } from './flamingo-header/flamingo-header.component';
import { FlamingoEditorComponent } from './flamingo-editor/flamingo-editor.component';
import { FlamingoPreviewComponent } from './flamingo-preview/flamingo-preview.component';
import { FlamingoPublishComponent } from './flamingo-publish/flamingo-publish.component';
import { FlamingoAnswerComponent } from './flamingo-answer/flamingo-answer.component';

const routes: Routes = [
  {
    path: '', component: FlamingoHeaderComponent, children: [
      {
        path: ':id', component: FlamingoEditorComponent
      },
      {
        path:':id/preview', component: FlamingoPreviewComponent
      },
      {
        path:':id/publish', component: FlamingoPublishComponent
      },
      {
        path:':id/answer', component: FlamingoAnswerComponent
      },
      {
        path:':id/result', component: FlamingoPreviewComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlamingoRoutingModule { }
