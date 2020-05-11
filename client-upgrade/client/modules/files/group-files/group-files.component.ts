import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-group-files',
  templateUrl: './group-files.component.html',
  styleUrls: ['./group-files.component.scss']
})
export class GroupFilesComponent implements OnInit {

  constructor(
    public utilityService: UtilityService
  ) { }

  // Base Url of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS

  // File Search Query
  query: any;

  // Files array variable
  files: any = []

  // Folders Array variable
  folders: any = [];

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  ngOnInit() {
    this.files = [...this.files, ...this.folders]
  }

  /**
   * This function observes the change in the search query variable
   * @param fileQuery 
   */
  fileSearchQuery(fileQuery: any){
    console.log(fileQuery)
  }

  onScroll(){

  }

}
