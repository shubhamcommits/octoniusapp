import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FlamingoHeaderComponent } from './flamingo-header/flamingo-header.component';
import { FlamingoEditorComponent } from './flamingo-editor/flamingo-editor.component';


const routes: Routes = [{
  path: '', component: FlamingoHeaderComponent, children: [
    { path: ':id', component: FlamingoEditorComponent }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlamingoRoutingModule { }
