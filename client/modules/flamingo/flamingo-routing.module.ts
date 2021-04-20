import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FlamingoHeaderComponent } from './flamingo-header/flamingo-header.component';
import { FlamingoEditorComponent } from './flamingo-editor/flamingo-editor.component';
import { FlamingoPreviewComponent } from './flamingo-preview/flamingo-preview.component';
import { FlamingoPublishComponent } from './flamingo-publish/flamingo-publish.component';

const routes: Routes = [
  {
    path: '', component: FlamingoHeaderComponent, children: [
      {
        path:'preview/:id', component:FlamingoPreviewComponent
      },
      {
        path:'publish/:id', component:FlamingoPublishComponent
      },
      { path: ':id', component: FlamingoEditorComponent },
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlamingoRoutingModule { }
