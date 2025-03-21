import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FolioEditorComponent } from './folio-editor/folio-editor.component';
import { FolioHeaderComponent } from './folio-header/folio-header.component';


const routes: Routes = [{
  path: '', component: FolioHeaderComponent, children: [
    { path: ':id', component: FolioEditorComponent }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FolioRoutingModule { }
