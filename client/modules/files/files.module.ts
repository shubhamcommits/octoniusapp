import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilesRoutingModule } from './files-routing.module';
import { GroupFilesComponent } from './group-files/group-files.component';

import { SharedModule } from 'src/app/common/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { GroupNewFileComponent } from './group-files/group-new-file/group-new-file.component';

/**
 * Services
 */
import { FilesService } from 'src/shared/services/files-service/files.service';

import { MatMenuModule } from '@angular/material/menu';
import { FolioModule } from 'modules/folio/folio.module';
import { FoldersService } from 'src/shared/services/folders-service/folders.service';
import { DragDropFilesDirective } from './group-files/drag-drop-files/drag-drop-files.directive';
import { FilesBarComponent } from './group-files/files-bar/files-bar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FilesSettingsDialogComponent } from './group-files/files-settings-dialog/files-settings-dialog.component';

@NgModule({
  declarations: [
    GroupFilesComponent,
    GroupNewFileComponent,
    FilesBarComponent,
    DragDropFilesDirective,
    FilesSettingsDialogComponent
  ],
  imports: [
    CommonModule,

    FilesRoutingModule,

    // Forms Module
    FormsModule,

    // Shared Module
    SharedModule,

    // Angular Material Menu Module
    MatMenuModule,

    // Folio Editor Module
    FolioModule,

    MatDialogModule,
    MatSlideToggleModule,
  ],
  providers: [
    // Files Service
    FilesService,

    // Folders Service
    FoldersService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class FilesModule { }
