import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core'
import { environment } from 'src/environments/environment'
import { PostService } from 'src/shared/services/post-service/post.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

// Google API Variables
declare var gapi: any
declare var google: any

@Component({
  selector: 'app-attach-files',
  templateUrl: './attach-files.component.html',
  styleUrls: ['./attach-files.component.scss']
})
export class AttachFilesComponent implements OnInit {

  // Post Object Input
  @Input('post') post: any;

  // Comment Object Input
  @Input() comment: any;

  // show icons
  @Input() showIcons: boolean = true;

  // Files Output Event Emitter
  @Output('files') files = new EventEmitter();

  // Files Output Event Emitter
  @Output('cloudFiles') cloudFiles = new EventEmitter();

  // Files Array
  filesArray = [];

  googleDriveFiles: any = [];

  // Base URL for the uploads
  baseUrl = environment.UTILITIES_POSTS_UPLOADS

  // Google picker state management
  pickerApiLoaded = false;

  authToken: string;

  constructor(
    private postService: PostService,
    private utilityService: UtilityService,
    public storageService: StorageService
  ) { }

  ngOnInit() {
    this.authToken = `Bearer ${this.storageService.getLocalData('authToken')['token']}`;
  }

  /**
   * This function returns an array of files attached with the input
   * @param files
   */
  onAttach(files: any) {

    // Set the files array to the incoming output
    for (let i = 0; i < files.target.files.length; i++) {
      this.filesArray.push(files.target.files[i]);
    }

    // Emit the value to other components
    return this.files.emit(this.filesArray)
  }

  onCloudFileAttach(){
    return this.cloudFiles.emit(this.googleDriveFiles);
  }

  save() {
    if (this.googleDriveFiles) {
      this.onCloudFileAttach();
    }
  }

  /**
   * This function is responsible for removing the specific file attached
   * @param index
   */
  async removeFile(index: number) {

    let arr = [];

    if (this.post && this.post.files) {
      // Remove element at the specific index
      arr = Array.from(this.post.files)
    } else if (this.comment && this.comment.files) {
      // Remove element at the specific index
      arr = Array.from(this.comment.files)
    }

    const file = arr[index];

    // Remove the element
    arr.splice(index, 1)

    if (this.post && this.post.files) {
      // Updated array
      this.post.files = arr
    } else if (this.comment && this.comment.files) {
      // Updated array
      this.comment.files = arr
    }

    await this.utilityService.asyncNotification($localize`:@@attachFiles.pleaseWaitUpdatingContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.postService.removeAttachedFile(file['modified_name'], this.post._id)
        .then((res) => {
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@attachFiles.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@attachFiles.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  /**
   * This function is responsible for removing the specific file attached which has not been uploaded yet
   * @param index
   */
  removeTmpFile(index: number) {

    // Remove element at the specific index
    let arr = Array.from(this.filesArray)

    const file = arr[index];

    // Remove the element
    arr.splice(index, 1)

    // Updated array
    this.filesArray = arr
  }

  loadGoogleCloudFiles() {

    // Instantiate the Auth client
    gapi.load('auth', { 'callback': this.onAuthApiLoad.bind(this) })

    // Instantiate the Picker
    gapi.load('picker', { 'callback': this.onPickerApiLoad.bind(this) })
  }

  /**
   * Authorize the google signin
   */
  onAuthApiLoad(integrations: any) {

    // Authorise the user and pass the results to the selection of picker
    gapi.auth.authorize(
      {
        'client_id': integrations.google_client_id,
        'scope': environment.GOOGLE_SCOPE,
        'immediate': false,
        'approval_prompt':'force',
      },
      this.handleAuthResult)
  }

  /**
   * Helper Function to set the state of the API
   */
  onPickerApiLoad() {
    this.pickerApiLoaded = true
  }

  /**
   * Handle the auth results
   * @param authResult
   */
  handleAuthResult(authResult: any) {
    if (authResult && !authResult.error) {
      if (authResult.access_token) {

        // Pick the new view
        let view = new google.picker.View(google.picker.ViewId.DOCS)

        //view.setMimeTypes("image/png,image/jpeg,image/jpg,video/mp4, application/vnd.ms-excel ,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/pdf, text/plain, application/msword, text/js, application/zip, application/rar, application/tar, text/html");

        // Initiate the PickerBuilder
        let pickerBuilder = new google.picker.PickerBuilder()

        // Feed the values into picker
        let picker = pickerBuilder
          .setOAuthToken(authResult.access_token)
          .addView(view)
          .addView(new google.picker.DocsUploadView())
          .setCallback((event: any) => {
            if (event[google.picker.Response.ACTION] == google.picker.Action.PICKED) {

              // Capture the response
              let doc = event[google.picker.Response.DOCUMENTS][0]

              // Store the documents URL
              let src = doc[google.picker.Document.URL]

              // Push the files
              let googleDriveFiles = event[google.picker.Response.DOCUMENTS]

              // Create custom element to show the file on UI
              const driveDivision = document.getElementById('google-drive-file')
              driveDivision.style.display = 'block'
              driveDivision.innerHTML =
                `<b>Drive File Upload: </b>
                  <a href='${src}' target='_blank'> ${googleDriveFiles[0]['name']}</a>`
            }
          }).build()

        // Set the Picker state
        picker.setVisible(true)

      }
    }
  }
}
