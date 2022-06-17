import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolioRoutingModule } from './folio-routing.module';
import { FolioHeaderComponent } from './folio-header/folio-header.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { FolioEditorComponent } from './folio-editor/folio-editor.component';
import { CreateTableComponent } from './folio-editor/create-table/create-table.component';

@NgModule({
  declarations: [
    FolioHeaderComponent,
    FolioEditorComponent,
    CreateTableComponent
  ],
  imports: [
    CommonModule,

    FolioRoutingModule,

    // Forms Module
    FormsModule,

    SharedModule
  ]
})
export class FolioModule { }
