import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormHeaderComponent } from './form-header/form-header.component';
import { FormEditorComponent } from './form-editor/form-editor.component';


const routes: Routes = [{
  path: '', component: FormHeaderComponent, children: [
    { path: ':id', component: FormEditorComponent }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormRoutingModule { }
