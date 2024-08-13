import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolioRoutingModule } from './folio-routing.module';
import { FolioHeaderComponent } from './folio-header/folio-header.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { FolioEditorComponent } from './folio-editor/folio-editor.component';
import { CreateTableComponent } from './folio-editor/create-table/create-table.component';
import { FolioCommentEditorComponent } from './folio-editor/folio-comment-editor/folio-comment-editor.component';

@NgModule({
  declarations: [
    FolioHeaderComponent,
    FolioEditorComponent,
    CreateTableComponent,
    FolioCommentEditorComponent
  ],
  imports: [
    CommonModule,

    FolioRoutingModule,

    // Forms Module
    FormsModule,

    SharedModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class FolioModule { }
