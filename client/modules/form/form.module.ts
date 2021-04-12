import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormRoutingModule } from './form-routing.module';
import { FormHeaderComponent } from './form-header/form-header.component';
import { FormEditorComponent } from './form-editor/form-editor.component';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';


@NgModule({
  declarations: [FormHeaderComponent, FormEditorComponent],
  imports: [
    CommonModule,

    FormRoutingModule,
    MatMenuModule,
    // Forms Module
    FormsModule,

    // Tooltip Module
    NgbTooltipModule,
  ]
})
export class FormModule { }
