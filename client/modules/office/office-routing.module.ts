import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from 'src/shared/guards/admin-guard/admin.guard';
import { StoryGuard } from 'src/shared/guards/story-guard/story.guard';
import { OfficeEditorComponent } from './office-editor/office-editor.component';
import { OfficeHeaderComponent } from './office-header/office-header.component';

const routes: Routes = [
  {path: '', component: OfficeHeaderComponent, children: [
    { path: ':id', component: OfficeEditorComponent }
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    AdminGuard,
    StoryGuard
  ]
})
export class OfficeRoutingModule { }
