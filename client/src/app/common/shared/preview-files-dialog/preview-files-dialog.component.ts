import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-preview-files-dialog',
  templateUrl: './preview-files-dialog.component.html',
  styleUrls: ['./preview-files-dialog.component.scss']
})
export class PreviewFilesDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

  fileUrl: string;
  viewer = 'url';

  ngOnInit() {
    if (this.data.id !== undefined && this.data.group !== undefined) {
      this.fileUrl = environment.clientUrl
          + '/#/document/' + this.data.id
          + '?group=' + this.data.group
          + '&readOnly=true';
    } else if (this.data.url !== undefined) {
      this.fileUrl = this.data.url;
    }

    if (this.fileUrl.indexOf('.doc') !== -1
        || this.fileUrl.indexOf('.ppt') !== -1
        || this.fileUrl.indexOf('.xls') !== -1) {
      this.viewer = 'office';
    }
  }
}
