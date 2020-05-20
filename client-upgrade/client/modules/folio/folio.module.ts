import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FolioRoutingModule } from './folio-routing.module';
import { FolioHeaderComponent } from './folio-header/folio-header.component';
import { FolioEditorComponent } from './folio-editor/folio-editor.component';


@NgModule({
  declarations: [FolioHeaderComponent, FolioEditorComponent],
  imports: [
    CommonModule,
    FolioRoutingModule
  ]
})
export class FolioModule { }
