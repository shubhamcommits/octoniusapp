import { FilesService } from './../../../src/shared/services/files-service/files.service';
import { Component, OnInit, Injector, Output, EventEmitter, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { Subject } from 'rxjs/internal/Subject';
import { SubSink } from 'subsink';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { MatDialog } from '@angular/material';
import { PreviewFilesDialogComponent } from 'src/app/common/shared/preview-files-dialog/preview-files-dialog.component';

@Component({
  selector: 'app-group-files',
  templateUrl: './group-files.component.html',
  styleUrls: ['./group-files.component.scss']
})
export class GroupFilesComponent implements OnInit {

  constructor(
    public utilityService: UtilityService,
    private injector: Injector,
    private router: ActivatedRoute,
    private filesService: FilesService,
    public dialog: MatDialog,
  ) { }

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');

  // Base Url of the users uploads
  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Base Url of the files uploads
  filesBaseUrl = environment.UTILITIES_FILES_UPLOADS;

  // Client Url of the global application
  clientUrl = environment.clientUrl;

  // Current User Data
  userData: any;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  // Query value variable mapped with search field
  query: string = "";

  // This observable is mapped with query field to recieve updates on change value
  queryChanged: Subject<any> = new Subject<any>();

  // Files array variable
  files: any = [];

  // Folders Array variable
  folders: any = [];

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Create subsink class to unsubscribe the observables
  public subSink = new SubSink();

  // Delete Event Emitter - Emits delete event
  @Output('delete') delete = new EventEmitter();

  async ngOnInit() {

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the uploaded files from the server
    this.files = await this.publicFunctions.getFiles(this.groupId)

    // Concat the files
    this.files = [...this.files, ...this.folders]
  }

  getFile(file: any){
    this.files.unshift(file)
  }

  ngAfterViewInit(){
    this.subSink.add(this.queryChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(async (res)=>{

        this.files = await this.publicFunctions.searchFiles(this.groupId, res);
      }))
  }

  /**
   * This function observes the change in the search query variable
   * @param fileQuery
   */
  fileSearchQuery(fileQuery: any) {
    this.queryChanged.next(fileQuery)
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  onScroll() {

  }

  /**
   * Unsubscribe all the observables on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
    this.isLoading$.complete()
  }

  /**
   * Call function to delete file
   * @param fileId
   */
  deleteFile(fileId: string) {
    // Ask User to remove this file or not
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          // Remove the file
          this.utilityService.asyncNotification('Please wait we are deleting the file...', new Promise((resolve, reject) => {
            this.filesService.deleteFile(fileId)
              .then((res) => {
                // Emit the Deleted file to all the components in order to update the UI
                this.delete.emit(res['file']);

                // Remove the file from the list
                this.files = this.files.filter(file => file._id !== fileId);

                resolve(this.utilityService.resolveAsyncPromise('File deleted!'));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise('Unable to delete file, please try again!'));
              });
          }));
        }
      });
  }

  openViewFileDialog(fileUrl: string) {
    const dialogRef = this.dialog.open(PreviewFilesDialogComponent, {
      width: '90%',
      height: '90%',
      data: {
        url: fileUrl
      }
    });
  }

  openViewFolioDialog(folioId: string) {
    const dialogRef = this.dialog.open(PreviewFilesDialogComponent, {
      width: '90%',
      height: '90%',
      data: {
        id: folioId,
        group: this.groupId
      }
    });
  }
}
