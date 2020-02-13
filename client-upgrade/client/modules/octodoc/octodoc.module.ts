import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OctodocRoutingModule } from './octodoc-routing.module';
import { OctodocEditorComponent } from './octodoc-editor/octodoc-editor.component';


@NgModule({
  declarations: [OctodocEditorComponent],
  imports: [
    CommonModule,
    OctodocRoutingModule
  ]
})
export class OctodocModule { }
