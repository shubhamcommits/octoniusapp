import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OfficeRoutingModule } from './office-routing.module';
import { OfficeEditorComponent } from './office-editor/office-editor.component';
import { OfficeHeaderComponent } from './office-header/office-header.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    OfficeHeaderComponent,
    OfficeEditorComponent
  ],
  imports: [
    FormsModule,
    OfficeRoutingModule,
    CommonModule
  ],
  providers: [],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [OfficeEditorComponent]
})
export class OfficeModule {}
