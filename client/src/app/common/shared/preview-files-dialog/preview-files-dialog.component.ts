import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { environment } from 'src/environments/environment';
// import { FilesService } from 'src/shared/services/files-service/files.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Component({
  selector: 'app-preview-files-dialog',
  templateUrl: './preview-files-dialog.component.html',
  styleUrls: ['./preview-files-dialog.component.scss']
})
export class PreviewFilesDialogComponent implements OnInit {

  fileUrl: string;
  viewer = 'url';

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public storageService: StorageService,
    // private filesService: FilesService
    ) {
  }

  async ngOnInit() {
    if (this.data.id !== undefined && this.data.group !== undefined) {
      let url = environment.clientUrl;
      if (environment.production) {
        url += '/' + this.locale;
      }
      this.fileUrl = url
          + '/document/' + this.data.id
          + '?readOnly=true';
    // } else if (this.data.modified_name && this.data.fileId && this.data.workspaceId && this.data.authToken) {
    //   await this.filesService.getMinioFile(this.data.fileId, this.data.modified_name, this.data.workspaceId, this.data.authToken).then(res =>{
    //     window.open(res['url'], "_blank");
    //     this.fileUrl = res['url'];
    //   });
    }

    if (this.fileUrl.indexOf('.doc') !== -1
        || this.fileUrl.indexOf('.ppt') !== -1
        || this.fileUrl.indexOf('.xls') !== -1) {
      this.viewer = 'office';
    }
  }
}
