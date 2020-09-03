import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
declare var gapi: any;
declare var google: any;

@Component({
  selector: 'app-attach-cloud-files',
  templateUrl: './attach-cloud-files.component.html',
  styleUrls: ['./attach-cloud-files.component.scss']
})
export class AttachCloudFilesComponent implements OnInit {

  pickerApiLoaded = false;

  constructor() { }

  ngOnInit() {
  }

  loadCloudFiles() {
    // if token already exist it just opens the picker else, it authenticates then follow the usual flow
    // auth -> get access_token -> opens the picker to choose the files
    if(localStorage.getItem('google-cloud-token')!= null){
      this.handleAuthResult(JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data);
    } else {
      gapi.load('auth', { 'callback': this.onAuthApiLoad.bind(this) });
      gapi.load('picker', { 'callback': this.onPickerApiLoad.bind(this) });
    }

  }

  onAuthApiLoad() {
    gapi.auth.authorize(
      {
        'client_id': environment.clientId,
        'scope': environment.scope,
        'immediate': false,
        'approval_prompt':'force',
      },
      this.handleAuthResult);
  }

  onPickerApiLoad() {
    this.pickerApiLoaded = true;
  }

  handleAuthResult(authResult) {
    let src;
    if (authResult && !authResult.error) {
      if (authResult.access_token) {
        let view = new google.picker.View(google.picker.ViewId.DOCS);
        //view.setMimeTypes("image/png,image/jpeg,image/jpg,video/mp4, application/vnd.ms-excel ,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/pdf, text/plain, application/msword, text/js, application/zip, application/rar, application/tar, text/html");
        let pickerBuilder = new google.picker.PickerBuilder();
        let picker = pickerBuilder.
        //enableFeature(google.picker.Feature.NAV_HIDDEN).
        setOAuthToken(authResult.access_token).
        //setOrigin(window.location.protocol + '//' + window.location.host).
        addView(view).
        addView(new google.picker.DocsUploadView()).
        setCallback(function (e) {
          if (e[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
            let doc = e[google.picker.Response.DOCUMENTS][0];
            src = doc[google.picker.Document.URL];

            this.googleDriveFiles = e[google.picker.Response.DOCUMENTS];

            const driveDivision = document.getElementById('google-drive-file');
            driveDivision.style.display = 'block';
            driveDivision.innerHTML = '<b>Drive File Upload: </b>' + '<a href=\''+ src + '\' target=\'_blank\'>' + this.googleDriveFiles[0]['name'] + '</a>';
          }
        }).
        build();
        picker.setVisible(true);
      }
    }
  }
}
