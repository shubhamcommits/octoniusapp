import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
declare var gapi: any;
declare var google: any;

@Component({
  selector: 'app-attach-files',
  templateUrl: './attach-files.component.html',
  styleUrls: ['./attach-files.component.scss']
})
export class AttachFilesComponent implements OnInit {

  constructor() { }

  // Post Object Input
  @Input('post') post: any;

  // Files Output Event Emitter
  @Output('files') files = new EventEmitter();

  // Files Output Event Emitter
  @Output() cloudFiles = new EventEmitter();

  // Files Array
  filesArray = new Array<File>()

  googleDriveFiles = [];

  // Base URL for the uploads
  baseUrl = environment.UTILITIES_POSTS_UPLOADS

  pickerApiLoaded = false;

  ngOnInit() {
  }

  /**
   * This function returns an array of files attached with the input
   * @param files
   */
  onAttach(files: any){

    // Set the files array to the incoming output
    this.filesArray = files.target.files;

    // Emit the value to other components
    return this.files.emit(this.filesArray)
  }

  /**
   * This function is responsible for removing the specific file attached
   * @param index
   */
  removeFile(index: number){

    // Remove element at the specific index
    let arr = Array.from(this.filesArray)

    // Remove the element
    arr.splice(index, 1)

    // Updated array
    this.filesArray = arr

    // Emit the value to other components
    return this.files.emit(this.filesArray)
  }

  loadCloudFiles() {
    // if token already exist it just opens the picker else, it authenticates then follow the usual flow
    // auth -> get access_token -> opens the picker to choose the files
    if(localStorage.getItem('google-cloud-token')!= null){
      gapi.load('picker', { 'callback': this.onPickerApiLoad.bind(this) });
      this.handleAuthResult(JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data)
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

            // TODO this emit is giving an error saying cloudFiles is undefined.
            // Emit the value to other components
            this.cloudFiles.emit(this.googleDriveFiles);
          }
        }).
        build();
        picker.setVisible(true);
      }
    }
  }
}
