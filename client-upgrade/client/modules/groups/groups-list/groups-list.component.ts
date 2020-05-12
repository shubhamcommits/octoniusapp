import { Component, OnInit, Injector } from '@angular/core';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.scss']
})
export class GroupsListComponent implements OnInit {

  constructor(
    public injector: Injector
  ) { }

  // Base Url
  baseUrl = environment.UTILITIES_GROUPS_UPLOADS;

  // Groups Service
  public groupsService = this.injector.get(GroupsService);

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // User data for the current user
  public userData: any = {};

  // Workspace data for the current workspace
  public workspaceData: any = {};

  // Array of user groups
  public userGroups: any = [];

  // More to load maintains check if we have more to load groups on scroll
  public moreToLoad: boolean = true;

  // LastGroupId
  public lastGroupId: string = '';

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  async ngOnInit() {
    
    // Starts the spinner 
    this.isLoading$.next(true);

    // Fetch the current loggedIn user data
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the current workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Fetches the user groups from the server
    this.userGroups = await this.publicFunctions.getUserGroups(this.workspaceData['_id'], this.userData['_id'])
    .catch(()=>{
      // If the function breaks, then catch the error and console to the application
      this.publicFunctions.sendError(new Error('Unable to connect to the server, please try again later!'));
      this.isLoading$.next(false);
    })

    // Calculates the lastGroupId based on the userGroups
    this.lastGroupId = this.userGroups[(this.userGroups.length-1)]['_id'];
    
    // Stops the spinner and return the value with ngOnInit
    return this.isLoading$.next(false);
  }

  public async onScroll() {
    if (this.moreToLoad) {
      this.isLoading$.next(true);
      await this.scrolled();
    }
  }

  /**
   * Helper function of onScroll to work on the business logic
   */
  public async scrolled() {
    if (this.userGroups && this.lastGroupId && this.lastGroupId != '' && this.lastGroupId != null) {

      // Fetching next pulse groups based on the lasgGroupId
      let nextPulseGroups: any = await this.publicFunctions.getNextUserGroups(this.workspaceData['_id'], this.userData['_id'], this.lastGroupId);

      // If we have 0 groups, then stop the function immediately and set moreToLoad to false
      if (nextPulseGroups.length == 0) {
        
        // Set more to load to false and stop the function
        this.moreToLoad = false;

        // Stop the loading spinner
        this.isLoading$.next(false);
      }

      // If we have groups then update the userGroups array and lastGroupId
      if (this.moreToLoad) {
        
        // Adding into exisiting array
        this.userGroups = [...this.userGroups, ...nextPulseGroups];

        // Removing duplicates from the array if any
        this.utilityService.removeDuplicates(this.userGroups, '_id').then((groups)=>{
          this.userGroups = groups;
        })

        // Updating lastGroupId with the lastest fetched data
        this.lastGroupId = this.userGroups[this.userGroups.length - 1]['_id'];

        // Stop the loading spinner
        this.isLoading$.next(false);
      }

    }
  }

  receiveGroupUpdates($event: Event){
    this.userGroups.push($event);
  }

  ngOnDestroy(){
    this.isLoading$.complete()
  }


}
