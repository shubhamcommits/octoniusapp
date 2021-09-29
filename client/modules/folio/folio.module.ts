import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FolioRoutingModule } from './folio-routing.module';
import { FolioHeaderComponent } from './folio-header/folio-header.component';
import { FolioEditorComponent } from './folio-editor2/folio-editor.component';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [FolioHeaderComponent, FolioEditorComponent],
  imports: [
    CommonModule,

    FolioRoutingModule,

    // Forms Module
    FormsModule,

    // Tooltip Module
    NgbTooltipModule,
  ]
})
export class FolioModule { }
