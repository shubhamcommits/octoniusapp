import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
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
    public storageService: StorageService) {
  }

  ngOnInit() {
    if (this.data.id !== undefined && this.data.group !== undefined) {
      let url = environment.clientUrl;
      if (environment.production) {
        url += '/' + this.locale;
      }
      this.fileUrl = url
          + '/document/' + this.data.id
          + '?group=' + this.data.group
          + '&readOnly=true';
    } else if (this.data.url !== undefined) {
      this.fileUrl = this.data.url + '?authToken=Bearer ' + this.storageService.getLocalData('authToken')['token'];
    }

    if (this.fileUrl.indexOf('.doc') !== -1
        || this.fileUrl.indexOf('.ppt') !== -1
        || this.fileUrl.indexOf('.xls') !== -1) {
      this.viewer = 'office';
    }
  }
}
