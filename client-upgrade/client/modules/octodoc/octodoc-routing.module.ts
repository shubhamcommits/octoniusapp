import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OctodocEditorComponent } from './octodoc-editor/octodoc-editor.component';


const routes: Routes = [
  {
    path: '', children:[
      {
        path: 'home', component: OctodocEditorComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OctodocRoutingModule { }
