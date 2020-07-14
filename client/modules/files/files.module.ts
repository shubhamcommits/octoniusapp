import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilesRoutingModule } from './files-routing.module';
import { GroupFilesComponent, PreviewFilesDialogComponent } from './group-files/group-files.component';

import { SharedModule } from 'src/app/common/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { GroupNewFileComponent } from './group-files/group-new-file/group-new-file.component';

/**
 * Services
 */
import { FilesService } from 'src/shared/services/files-service/files.service';

import { MatMenuModule, MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
import { FolioModule } from 'modules/folio/folio.module';

import { NgxDocViewerModule } from 'ngx-doc-viewer';

@NgModule({
  declarations: [GroupFilesComponent, GroupNewFileComponent, PreviewFilesDialogComponent],
  imports: [
    CommonModule,

    FilesRoutingModule,

    // Forms Module
    FormsModule,

    // Shared Module
    SharedModule,

    // Angular Material Menu Module
    MatMenuModule,

    // Angular Material Dialog
    MatDialogModule,

    // Folio Editor Module
    FolioModule,

    NgxDocViewerModule,
  ],
  providers: [

    // Files Service
    FilesService,

    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
  ],
  entryComponents: [
    PreviewFilesDialogComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class FilesModule { }
