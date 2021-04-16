import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FlamingoHeaderComponent } from './flamingo-header/flamingo-header.component';
import { FlamingoEditorComponent } from './flamingo-editor/flamingo-editor.component';
import { FlamingoPreviewComponent } from './flamingo-preview/flamingo-preview.component';

const routes: Routes = [
  {
    path: '', component: FlamingoHeaderComponent, children: [
      { path: ':id', component: FlamingoEditorComponent },
      {
        path:'/preview', component:FlamingoPreviewComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlamingoRoutingModule { }
