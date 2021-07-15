import { Component, OnInit, Injector, OnDestroy, AfterViewInit } from '@angular/core';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { GroupService } from 'src/shared/services/group-service/group.service';

@Component({
  selector: 'app-admin-groups',
  templateUrl: './admin-groups.component.html',
  styleUrls: ['./admin-groups.component.scss']
})
export class AdminGroupsComponent implements OnInit, AfterViewInit, OnDestroy {

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // ACTIVE GROUPS LIST
  public activeGroups: any = [];

  // ARCHIVED GROUPS LIST
  public archivedGroups: any = [];

  // PLACEHOLDER INPUT FOR SEARCH BAR
  public searchBarPlaceholder = 'Search groups...';

  // WORKSPACE DATA
  public workspaceData: any;

  // USER DATA
  public currentUser: any;

  // Query value variable mapped with search field
  query: string = "";

  // This observable is mapped with query field to recieve updates on change value
  queryChanged: Subject<any> = new Subject<any>();

  // More to load maintains check if we have more to load active groups on scroll
  public moreActiveToLoad: boolean = true;

  // More to load maintains check if we have more to load archived groups on scroll
  public moreArchivedToLoad: boolean = true;

  // lastActiveGroupId
  public lastActiveGroupId: string = '';

  // lastArchivedGroupId
  public lastArchivedGroupId: string = '';

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    public utilityService: UtilityService,
    private injector: Injector,
  ) { }

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'admin'
    })

    // Fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Fetch the current user details
    this.currentUser = await this.publicFunctions.getCurrentUser();

    // Initialize the active groups
    this.activeGroups = await this.publicFunctions.getAllGroupsList(this.workspaceData._id);

    // Updating lastActiveGroupId with the lastest fetched data
    if (this.activeGroups && this.activeGroups.length > 0) {
      this.lastActiveGroupId = this.activeGroups[this.activeGroups.length - 1]['_id'];
    }

    // Initialize the archived groups
    this.archivedGroups = await this.publicFunctions.getAllArchivedGroupsList(this.workspaceData?._id);

    // Updating lastArchivedGroupId with the lastest fetched data
    if (this.archivedGroups && this.archivedGroups.length > 0) {
      this.lastArchivedGroupId = this.archivedGroups[this.archivedGroups.length - 1]['_id'];
    }
  }

  /**
   * This function handles of sending the notification to the user about the email validation
   * Uses Debounce time and subscribe to the emailChanged Observable
   */
  ngAfterViewInit(): void {
    // Adding the service function to the subsink(), so that we can unsubscribe the observable when the component gets destroyed
    this.subSink.add(this.queryChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(async () => {

        // Results array which stores the members list
        let activeResults: any = []
        let archivedResults: any = []

        // Fetch the results from the helper function
        activeResults = await this.publicFunctions.searchWorkspaceActiveGroups(this.workspaceData?._id, this.query) || []
        archivedResults = await this.publicFunctions.searchWorkspaceArchivedGroups(this.workspaceData?._id, this.query) || []

        // Update the groups arrays
        this.activeGroups = activeResults['groups'];
        this.archivedGroups = archivedResults['groups'];

        // Set the loading state to be false
        this.isLoading$.next(false);
      }));
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

  /**
   * This function searches the members
   * @param query
   */
  groupsSearchQuery(query: any) {
    try {

      // Set the loading state to be true
      this.isLoading$.next(true);

      // Set the next state change of Subject
      this.queryChanged.next(query);


    } catch (err) {
      this.publicFunctions.sendError(err);
    }
  }

  public async onActiveScroll() {
    if (this.moreActiveToLoad) {

      // Start the loading spinner
      this.isLoading$.next(true);

      // Get the results from the helper functions
      await this.activeScrolled();
    }
  }

  async activeScrolled() {
    if (this.activeGroups && this.lastActiveGroupId && this.lastActiveGroupId != '' && this.lastActiveGroupId != null) {

      // Initialise the nextUsers array
      let nextActiveGroups: any = []

      // Fetching next active group based on the lastActiveGroupId
      nextActiveGroups = await this.publicFunctions.getNextAllGroupsList(this.workspaceData['_id'], this.lastActiveGroupId);

      if (nextActiveGroups.length > 0) {
        // Adding into exisiting array
        this.activeGroups = [...this.activeGroups, ...nextActiveGroups];

        // Removing duplicates from the array if any
        this.utilityService.removeDuplicates(this.activeGroups, '_id').then((groups) => {
          this.activeGroups = groups;
        });

        // Updating lastUserId with the lastest fetched data
        this.lastActiveGroupId = this.activeGroups[this.activeGroups.length - 1]['_id'];
      }

      // If we have 0 users, then stop the function immediately and set moreToLoad to false
      if (nextActiveGroups.length < 5) {
        // Set more to load to false and stop the function
        this.moreActiveToLoad = false;
      }
    }

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  public async onArchivedScroll() {
    if (this.moreArchivedToLoad) {

      // Start the loading spinner
      this.isLoading$.next(true);

      // Get the results from the helper functions
      await this.archivedScrolled();
    }
  }

  async archivedScrolled() {
    if (this.archivedGroups && this.lastArchivedGroupId && this.lastArchivedGroupId != '' && this.lastArchivedGroupId != null) {

      // Initialise the nextUsers array
      let nextArchivedGroups: any = []

      // Fetching next archived group based on the lastArchivedGroupId
      nextArchivedGroups = await this.publicFunctions.getNextAllGroupsList(this.workspaceData['_id'], this.lastArchivedGroupId);

      if (nextArchivedGroups.length > 0) {
        // Adding into exisiting array
        this.archivedGroups = [...this.archivedGroups, ...nextArchivedGroups];

        // Removing duplicates from the array if any
        this.utilityService.removeDuplicates(this.archivedGroups, '_id').then((groups) => {
          this.archivedGroups = groups;
        });

        // Updating lastUserId with the lastest fetched data
        this.lastArchivedGroupId = this.archivedGroups[this.archivedGroups.length - 1]['_id'];
      }

      // If we have 0 users, then stop the function immediately and set moreToLoad to false
      if (nextArchivedGroups.length < 5) {
        // Set more to load to false and stop the function
        this.moreArchivedToLoad = false;
      }
    }

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  archiveGroup(groupId: string, archive: boolean) {

    // Group Service Instance
    let groupService = this.injector.get(GroupService);

    // Utility Service Instancr
    let utilityService = this.injector.get(UtilityService);

    let confirmMessage = '';
    let resolveMessage = '';
    let errorMessage = '';
    if (archive) {
      confirmMessage = 'This action will archive the group.';
      resolveMessage = 'Group archived!';
      errorMessage = 'Unable to archive the group, please try again!';
    } else {
      confirmMessage = 'This action will activate the group.';
      resolveMessage = 'Group activated!';
      errorMessage = 'Unable to activate the group, please try again!';
    }

    // Ask User to delete the group or not
    utilityService.getConfirmDialogAlert('Are you sure?', confirmMessage)
      .then((result) => {
        if (result.value) {

          // Delete the group from the workspace
          utilityService.asyncNotification('Please Wait while we update the group',
            new Promise((resolve, reject) => {
              // Call Archive Group Service Function
              groupService.archiveGroup(groupId, archive)
                .then(async () => {
                  // Remove group from list and move to the other list
                  if (archive) {
                    const index = this.activeGroups.findIndex(group => group._id == groupId);
                    const archivedGroup = this.activeGroups[index];
                    // Remove the group from the active groups
                    this.activeGroups.splice(index, 1);
                    // Add the group to the archived groups array
                    this.archivedGroups.unshift(archivedGroup);
                    // Ortder groups
                    this.archivedGroups.sort((g1, g2) => (g1._id > g2._id) ? 1 : -1);
                  } else {
                    const index = this.archivedGroups.findIndex(group => group._id == groupId);
                    const activeGroup = this.archivedGroups[index];
                    // Remove the group from the archived groups
                    this.archivedGroups.splice(index, 1);
                    // Add the group to the active groups array
                    this.activeGroups.unshift(activeGroup);
                    // Ortder groups
                    this.activeGroups.sort((g1, g2) => (g1._id > g2._id) ? 1 : -1);
                  }

                  // Updating lastActiveGroupId with the lastest fetched data
                  if (this.activeGroups && this.activeGroups.length > 0) {
                    this.lastActiveGroupId = this.activeGroups[this.activeGroups.length - 1]['_id'];
                  } else {
                    this.lastActiveGroupId = '';
                  }

                  // Updating lastArchivedGroupId with the lastest fetched data
                  if (this.archivedGroups && this.archivedGroups.length > 0) {
                    this.lastArchivedGroupId = this.archivedGroups[this.archivedGroups.length - 1]['_id'];
                  } else {
                    this.lastArchivedGroupId = '';
                  }
                  // Resolve the async promise
                  resolve(utilityService.resolveAsyncPromise(resolveMessage));
                })
                .catch(() => {
                  // Reject the promise
                  reject(utilityService.rejectAsyncPromise(errorMessage))
                });
            }));
        }
      });
  }

  removeGroup(groupId: string) {

    // Group Service Instance
    let groupService = this.injector.get(GroupService);

    // Utility Service Instancr
    let utilityService = this.injector.get(UtilityService);

    // Ask User to delete the group or not
    utilityService.getConfirmDialogAlert('Are you sure?', 'This action will completely remove the group.')
      .then((result) => {
        if (result.value) {

          // Delete the group from the workspace
          utilityService.asyncNotification('Please Wait while we update the group',
            new Promise((resolve, reject) => {
              // Call Remove Group Service Function
              groupService.removeGroup(groupId)
                .then(async () => {
                  // Remove group from list and move to the other list
                  const index = this.archivedGroups.findIndex(group => group._id == groupId);
                  const activeGroup = this.archivedGroups[index];
                  // Remove the group from the archived groups
                  this.archivedGroups.splice(index, 1);

                  // Updating lastArchivedGroupId with the lastest fetched data
                  if (this.archivedGroups && this.archivedGroups.length > 0) {
                    this.lastArchivedGroupId = this.archivedGroups[this.archivedGroups.length - 1]['_id'];
                  } else {
                    this.lastArchivedGroupId = '';
                  }

                  // Resolve the async promise
                  resolve(utilityService.resolveAsyncPromise('Group removed!'));
                })
                .catch(() => {
                  // Reject the promise
                  reject(utilityService.rejectAsyncPromise('Unable to remove the group, please try again!'))
                });
            }));
        }
      });
  }

}
