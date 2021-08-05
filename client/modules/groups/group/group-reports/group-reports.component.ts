import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Component({
  selector: 'app-group-reports',
  templateUrl: './group-reports.component.html',
  styleUrls: ['./group-reports.component.scss']
})
export class GroupReportsComponent implements OnInit {

  constructor(
    private router: ActivatedRoute,
    private injector: Injector,
    private storageService: StorageService
  ) { }

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group')

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  // Campaign File
  campaignFile: any

  // Campaign File URL
  campaignFileUrl: any

  // Base Url of the files uploads
  filesBaseUrl = environment.UTILITIES_FILES_UPLOADS

  // Auth Token
  authToken: string

  // Files List
  files: any = []

  // Loading Behaviour
  isLoading$ = new BehaviorSubject(false)

  // User Data Object
  userData: any

  // Current user member check
  isCurrentUserMember = false

  async ngOnInit() {

    // Change the loading state
    this.isLoading$.next(true)

    // Fetch Current User
    this.userData = await this.publicFunctions.getCurrentUser()

    // Current User Member check update
    this.isCurrentUserMember = (this.userData.role === 'member') ? true : false

    // Fetch the token
    this.authToken = `Bearer ${this.storageService.getLocalData('authToken')['token']}`

    // Fetch all campaign files
    this.files = await this.publicFunctions.getCampaignFiles(this.groupId)

    // Pickup the latest campaign file
    if (this.files.length > 0) {
      this.campaignFile = this.files[0]
      this.campaignFileUrl = `${this.filesBaseUrl}/${this.files[0].modified_name}?authToken=${this.authToken}`
    }

    // Change the loading state
    this.isLoading$.next(false)
  }

  changeValue(event){
    this.campaignFile = event
    this.campaignFileUrl = `${this.filesBaseUrl}/${event.modified_name}?authToken=${this.authToken}`
  }

}
