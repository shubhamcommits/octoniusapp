import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FolioRoutingModule } from './folio-routing.module';
import { FolioHeaderComponent } from './folio-header/folio-header.component';
import { FolioEditorComponent } from './folio-editor2/folio-editor.component';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CreateTableComponent } from './folio-editor2/create-table/create-table.component';
import { ImageResizeModalComponent } from './folio-editor2/image-resize-modal/image-resize-modal.component';
import { SharedModule } from 'src/app/common/shared/shared.module';
@NgModule({
  declarations: [FolioHeaderComponent, FolioEditorComponent, CreateTableComponent, ImageResizeModalComponent],
  imports: [
    CommonModule,

    FolioRoutingModule,

    // Forms Module
    FormsModule,

    // Tooltip Module
    NgbTooltipModule,
    SharedModule
  ]
})
export class FolioModule { }
