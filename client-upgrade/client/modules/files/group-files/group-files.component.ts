import { Component, OnInit, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { PublicFunctions } from 'src/app/dashboard/public.functions';

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
  ) { }

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot['_urlSegment']['segments'][2]['path'];

  // Base Url of the users uploads
  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Base Url of the files uploads
  filesBaseUrl = environment.UTILITIES_FILES_UPLOADS;

  // Current User Data
  userData: any;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  // File Search Query
  query: any;

  // Files array variable
  files: any = [];

  // Folders Array variable
  folders: any = [];

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  async ngOnInit() {

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the uploaded files from the server
    this.files = await this.publicFunctions.getFiles(this.groupId)

    // Concat the files
    this.files = [...this.files, ...this.folders]
  }

  getFile(file: any){
    console.log(file)
    this.files.push(file)
  }

  /**
   * This function observes the change in the search query variable
   * @param fileQuery 
   */
  fileSearchQuery(fileQuery: any) {
    console.log(fileQuery)
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  onScroll() {

  }

}
