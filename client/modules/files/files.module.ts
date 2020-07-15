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

import { MatMenuModule } from '@angular/material';
import { FolioModule } from 'modules/folio/folio.module';

@NgModule({
  declarations: [GroupFilesComponent, GroupNewFileComponent],
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
  ],
  providers: [
    // Files Service
    FilesService,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class FilesModule { }
