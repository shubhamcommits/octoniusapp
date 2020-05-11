import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupFilesComponent } from './group-files/group-files.component';

const routes: Routes = [
  { path: '', component: GroupFilesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilesRoutingModule { }
