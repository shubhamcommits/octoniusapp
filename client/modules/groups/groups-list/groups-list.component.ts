import { Component, OnInit, Injector, Input } from '@angular/core';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.scss']
})
export class GroupsListComponent implements OnInit {

  @Input() userData;
  @Input() workspaceData;

  // Base Url
  baseUrl = environment.UTILITIES_GROUPS_UPLOADS;

  // Array of user groups
  public userGroups: any = [];

  // Agora groups not joined
  public agoraGroups: any = [];

  // More to load maintains check if we have more to load groups on scroll
  public moreToLoad: boolean = true;

  // More Agora groups boolean
  public moreAgora: boolean = true;

  // LastGroupId
  public lastGroupId: string = '';

  // Last agora group ID
  public lastAgoraGroupId: string = '';

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  public isLoadingAgora$ = new BehaviorSubject(false);

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    private router: Router,
    private utilityService: UtilityService
  ) { }

  async ngOnInit() {

    // Starts the spinner
    this.isLoading$.next(true);
    this.isLoadingAgora$.next(true);

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'work'
    })

    // Fetch the current loggedIn user data
    if (!this.utilityService.objectExists(this.userData)) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    if (!this.utilityService.objectExists(this.workspaceData)) {
      // Fetch the current workspace data
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    // Fetches the user groups from the server
    this.userGroups = await this.publicFunctions.getUserGroups(this.workspaceData?._id, this.userData?._id)
      .catch(() => {
        // If the function breaks, then catch the error and console to the application
        this.publicFunctions.sendError(new Error($localize`:@@groupList.unableToConnectToServer:Unable to connect to the server, please try again later!`));
        this.isLoading$.next(false);
      })

    this.agoraGroups = await this.publicFunctions.getAgoraGroupsNotJoined(this.workspaceData?._id, this.userData?._id)
      .catch(() => {
        // If the function breaks, then catch the error and console to the application
        this.publicFunctions.sendError(new Error($localize`:@@groupList.unableToConnectToServer:Unable to connect to the server, please try again later!`));
        this.isLoadingAgora$.next(false);
      })

    // Calculates the lastGroupId based on the userGroups
    if (this.userGroups && this.userGroups.length > 0)
      this.lastGroupId = this.userGroups[(this.userGroups?.length - 1)]['_id'];

    if (this.agoraGroups && this.agoraGroups.length > 0) {
      this.lastAgoraGroupId = this.agoraGroups[this.agoraGroups?.length - 1]['_id'];
    }

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
    this.isLoadingAgora$.next(false);
  }

  ngOnDestroy() {
    this.isLoading$.complete()
  }

  public async onScroll() {
    this.isLoading$.next(true);
    await this.scrolled();
    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  public async onAgoraScroll() {
    if (this.moreAgora) {
      this.isLoadingAgora$.next(true);
      await this.AgoraScrolled();
    }
  }

  /**
   * Helper function of onScroll to work on the business logic
   */
  public async scrolled() {
    if (this.userGroups && this.lastGroupId && this.lastGroupId != '' && this.lastGroupId != null) {

      // Fetching next pulse groups based on the lasgGroupId
      let nextPulseGroups: any = await this.publicFunctions.getNextUserGroups(this.workspaceData?._id, this.userData?._id, this.lastGroupId);

      // If we have 0 groups, then stop the function immediately and set moreToLoad to false
      if (nextPulseGroups.length == 0) {

        // Set more to load to false and stop the function
        this.moreToLoad = false;
      }

      // If we have groups then update the userGroups array and lastGroupId
      if (this.moreToLoad) {

        // Adding into exisiting array
        this.userGroups = [...this.userGroups, ...nextPulseGroups];

        // Removing duplicates from the array if any
        this.utilityService.removeDuplicates(this.userGroups, '_id').then((groups) => {
          this.userGroups = groups;
        })

        // Updating lastGroupId with the lastest fetched data
        this.lastGroupId = this.userGroups[this.userGroups?.length - 1]['_id'];
      }

    }
  }

  /**
   * Helper function of AgoraScroll to work on the business logic
   */
  public async AgoraScrolled() {

    let nextAgoraGroups: any = await this.publicFunctions.getNextAgoraGroups(this.workspaceData?._id, this.userData?._id, this.lastAgoraGroupId);

    // Adding into existing array
    this.agoraGroups = [...this.agoraGroups, ...nextAgoraGroups];

    // Removing Duplicates
    this.utilityService.removeDuplicates(this.agoraGroups, '_id').then((groups) => {
      this.agoraGroups = groups;
    })

    if (this.moreAgora && this.agoraGroups && this.agoraGroups.length > 0) {
      this.lastAgoraGroupId = this.agoraGroups[this.agoraGroups?.length - 1]['_id'];

    }

    // Stop the loading spinner
    this.isLoadingAgora$.next(false);
  }

  receiveGroupUpdates($event: Event) {
    this.userGroups.push($event);
  }

  async joinGroup(groupId: any) {
    await this.publicFunctions.joinAgora(groupId, this.userData._id).then(async (res) => {
      this.goToGroup(groupId);
    });

  }

  /**
   * This function is responsible for returning the unique group members count
   * @param members
   * @param admins
   * @returns
   */
   getUniqueMembersCount(members, admins) {

    if (members.length >= 0 && admins.length >= 0) {
      // Merge the Admin and Members array
      Array.prototype.push.apply(members, admins)

      // Set the value of members and remove the duplicates
      members = Array.from(new Set(members))

      return members.length
    }
    else
      return 0

  }

  async goToGroup(groupId: string) {
    const newGroup = await this.publicFunctions.getGroupDetails(groupId);
    await this.publicFunctions.sendUpdatesToGroupData(newGroup);
    this.router.navigate(['/dashboard', 'work', 'groups', 'activity']);
  }
}
