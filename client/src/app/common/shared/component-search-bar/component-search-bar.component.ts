import { Component, OnInit, Input, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { SubSink } from 'subsink';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { MatDialog } from '@angular/material/dialog';
import { UserUpdateProfileDialogComponent } from '../user-update-profile-dialog/user-update-profile-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-component-search-bar',
  templateUrl: './component-search-bar.component.html',
  styleUrls: ['./component-search-bar.component.scss']
})
export class ComponentSearchBarComponent implements OnInit {

  constructor(
    private injector: Injector,
    private router: Router,
    public utilityService: UtilityService,
    public dialog: MatDialog) { }

  // Placeholder for the input bar
  @Input('placeholder') placeholder: string = '';

  // Type are 'workspace', 'group'
  @Input('type') type: string;

  // Incase the type is 'group'
  @Input('groupId') groupId?: string;

  // Group Data Object
  @Input('groupData') groupData?: any = {};

  // User Data Object
  @Input('userData') userData: any = {};

  // Incase the type is 'workspace'
  @Input('workspaceId') workspaceId?: string;

  // Workspace Data Object
  @Input('workspaceData') workspaceData?: any = {};

  // Members array
  @Input('members') members: any = [];

  panelOpenState:any=false;

  // BASE URL OF THE APPLICATION
  public baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Public Functions class
  private publicFunctions = new PublicFunctions(this.injector);

  // More to load maintains check if we have more to load members on scroll
  public moreToLoad: boolean = true;

  // LastUserId
  public lastUserId: string = '';

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Query value variable mapped with search field
  query: string = "";

  ActiveMembers:any=[];
  DisabledMembers:any=[];

  // This observable is mapped with query field to recieve updates on change value
  queryChanged: Subject<any> = new Subject<any>();

  // Create subsink class to unsubscribe the observables
  public subSink = new SubSink();

  ngOnInit() {

    // Calculate the lastUserId
    this.lastUserId = this.members[this.members.length - 1]['_id'];
    this.separateDisabled(this.members);
  }

  async separateDisabled(members){
    this.ActiveMembers=[];
    this.DisabledMembers=[];
    members.forEach((member,index) => {
      if(member.active) {
          member.index = index;
          this.ActiveMembers.push(member);
      } else {
        member.index = index;
        this.DisabledMembers.push(member);
      }
    });
  }

  /**
   * This method is binded to keyup event of query input field
   * @param $event
   */
  queryChange($event: Event) {
    this.queryChanged.next($event);
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
        let results: any = []

        if (this.type === 'workspace' || this.type === 'group' || this.type === 'bar') {

          // If value is null then update the array back to normal
          if (this.query == "") {

            // Intialise the members back to normal
            if (this.type === 'workspace') {
              this.members = this.workspaceData.members;
            }
            // Intialise the members back to normal
            if (this.type === 'group') {

              // Merge the Admin and Members array
              Array.prototype.push.apply(this.groupData._members, this.groupData._admins);

              // Set the value of members and remove the duplicates
              this.members = Array.from(new Set(this.groupData._members));
            }


            // Set the moreload to true
            this.moreToLoad = true

            // Calculate the lastUserId
            this.lastUserId = this.members[this.members.length - 1]['_id'];

          } else {

            // Fetch the results from the helper function
            if (this.type === 'workspace') {
              results = await this.publicFunctions.searchWorkspaceMembers(this.workspaceId, this.query) || []
            }

            // Fetch the results from the helper function
            if (this.type === 'group' || this.type === 'bar') {
              results = await this.publicFunctions.searchGroupMembers(this.groupId, this.query) || []
            }

            // Update the members array
            this.members = results['users'];
          }
        }

        this.separateDisabled(this.members);

        // Set the loading state to be false
        this.isLoading$.next(false);
      }));
  }

  /**
   * This function is responsible for removing the user from the group
   * @param groupId
   * @param userId
   * @param index
   */
  removeUserFromGroup(groupId: string, userId: string, index: number) {

    // Create Service Instance
    let groupService = this.injector.get(GroupService);
    // Ask User to remove this user from the group or not
    this.utilityService.getConfirmDialogAlert('Are you sure?',
     'This will deactivate user!')
      .then((result) => {
        if (result.value) {
          // Remove the User
          this.utilityService.asyncNotification('Please wait while we are removing the user ...',
            new Promise((resolve, reject) => {
              groupService.removeUser(groupId, userId)
                .then(() => {
                  // Member Details
                  let member = this.members[index];
                  // Update the GroupData
                  this.groupData._members.splice(this.groupData._members.findIndex((user: any) => user._id === member._id), 1)
                  this.groupData._admins.splice(this.groupData._admins.findIndex((user: any) => user._id === member._id), 1)

                  // Update UI via removing from array
                  this.members.splice(index, 1);

                  // Send updates to groupData via service
                  this.publicFunctions.sendUpdatesToGroupData(this.groupData);

                  let resolveMessage = 'User removed!';
                  if(userId == this.userData?._id) {
                    resolveMessage = 'Group left!';

                    this.router.navigate(['/home']);
                  }

                  // Resolve with success
                  resolve(this.utilityService.resolveAsyncPromise(resolveMessage));

                })
                .catch(() => reject(this.utilityService.rejectAsyncPromise('Unable to remove the user from the group, please try again!')))
            }))
        }
      });
  }

  /**
   * Function to remove member from workspace
   * @param userId User to remove
   * @param workspaceId Workspace to remove from
   * @param index
   */
  reactivateUserInWorkplace(userId, workspaceId, index) {
    // Create Service Instance
    const workspaceService = this.injector.get(WorkspaceService);

    // Ask User to enable this user from the group or not
    this.utilityService.getConfirmDialogAlert('Are you sure?',
    'This action will enable the user.')
      .then((result) => {
        if (result.value) {

          // Remove the User
          this.utilityService.asyncNotification('Please wait while we are enabling the user ...',
            new Promise((resolve, reject) => {
              workspaceService.reactivateUserToWorkplace(userId, workspaceId)
                .then(() => {
                  const member = this.members.find((element) => {
                    if (element._id === userId) {
                    return element;
                  }
                  });
                  member.active = true;
                  this.members[index] = member;
                  this.members.sort((x, y) => {
                    return (x.active === y.active) ? 0 : x.active ? -1 : 1;
                  });

                  this.separateDisabled(this.members);
                  // Resolve with success
                  resolve(this.utilityService.resolveAsyncPromise('User activated!'));
                })
                .catch(() => reject(this.utilityService
                  .rejectAsyncPromise('Unable to reactivate the user from the workplace, please try again!')));
            }));
        }
    });
  }

  /**
   * Function to remove member from workspace
   * @param userId User to remove
   * @param workspaceId Workspace to remove from
   * @param index
   */
  removeUserFromWorkplace(userId, workspaceId, index) {

    // Create Service Instance
    let workspaceService = this.injector.get(WorkspaceService);

    // Ask User to remove this user from the group or not
    this.utilityService.getConfirmDialogAlert('Are you sure?',
    'This action will disable the user.')
      .then((result) => {
        if (result.value) {

          // Remove the User
          this.utilityService.asyncNotification('Please wait while we are disabling the user ...',
            new Promise((resolve, reject) => {
              workspaceService.removeUserFromWorkspace(userId, workspaceId)
                .then(() => {
                  const member = this.members.find((element) => {
                    if (element._id === userId) {
                    return element;
                  }
                  });
                  member.active = false;
                  this.members[index] = member;
                  this.members.sort((x, y) => {
                    return (x.active === y.active) ? 0 : x.active ? -1 : 1;
                  });

                  // Send updates to workspaceData via service
                  this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData)
                  this.separateDisabled(this.members);

                  // Resolve with success
                  resolve(this.utilityService.resolveAsyncPromise('User removed!'))
                })
                .catch(() => reject(this.utilityService.rejectAsyncPromise('Unable to remove the user from the workplace, please try again!')))
            }))
        }
      })

  }

  /**
   * This function searches the members
   * @param query
   */
  userSearchQuery(query: any) {
    try {

      // Set the loading state to be true
      this.isLoading$.next(true);

      // Set the next state change of Subject
      this.queryChange(query)


    } catch (err) {
      this.publicFunctions.sendError(err);
    }
  }

  /**
   * This function is responsible for changing the roles of the users
   * @param userId - userId of the user of member object
   * @param role - 'admin' or 'member'
   * @param index - current index of the object in the array
   */
  async changeRole(userId: string, role: string, index: number) {

    // Create a new User Service Object
    let userService = this.injector.get(UserService);

    // Create a new utility Service Object
    let utilityService = this.injector.get(UtilityService);

    // Create a new Socket Service Object
    let socketService = this.injector.get(SocketService);

    // Instatiate the request to change the role
    utilityService.asyncNotification('Please wait we are updating the role as per your request...',
      new Promise((resolve, reject) => {
        userService.updateUserRole(userId, role)
          .then((res) => {

            // Update the current member role
            this.members[index].role = role;

            // Update the current workspace data with updated list of members
            this.workspaceData.members = this.members;

            // Send the data over the service and storage layer throughout the entire app
            this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);

            // Update the localdata of all the connected users
            this.publicFunctions.emitWorkspaceData(socketService, this.workspaceData)

            // Updates the local data of the user to tell them about that their role has been updated
            this.publicFunctions.emitUserData(socketService, this.members[index]['_id'], this.members[index]);

            // Resolve the promise with success
            resolve(utilityService.resolveAsyncPromise(`User updated to ${role}!`))
          })
          .catch((err) => {
            console.log('Error occured, while updating the role', err);
            reject(utilityService.rejectAsyncPromise('Oops, an error occured while updating the role, please try again!'))
          })
      }))
  }

  public async onScroll() {
    if (this.moreToLoad) {

      // Start the loading spinner
      this.isLoading$.next(true);

      // Get the results from the helper functions
      await this.scrolled();
    }
  }

  async scrolled() {
    if (this.members && this.lastUserId && this.lastUserId != '' && this.lastUserId != null) {

      // Initialise the nextUsers array
      let nextUsers: any = []

      // Fetching next users based on the lastUserId
      if (this.type === 'workspace') {
        nextUsers = await this.publicFunctions.getNextWorkspaceMembers(this.workspaceData['_id'], this.lastUserId, this.query);
      }

      if (this.type === 'group') {
        nextUsers = await this.publicFunctions.getNextGroupMembers(this.groupId, this.lastUserId, this.query)
      }

      if (nextUsers.length > 0) {
        // Adding into exisiting array
        this.members = [...this.members, ...nextUsers];

        // Removing duplicates from the array if any
        this.utilityService.removeDuplicates(this.members, '_id').then((groups) => {
          this.members = groups;
        })

        // Updating lastUserId with the lastest fetched data
        this.lastUserId = this.members[this.members.length - 1]['_id'];
      }

      // If we have 0 users, then stop the function immediately and set moreToLoad to false
      if (nextUsers.length < 5) {
        // Set more to load to false and stop the function
        this.moreToLoad = false;
      }
    }

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  /**
   * Unsubscribe all the observables on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
    this.isLoading$.complete()
  }

  isGroupManager(userId) {
    return (this.groupData && this.groupData._admins) ? this.groupData._admins.find(admin => admin._id === userId) : false;
  }

  /**
   * This function is responsible for changing the roles of the users
   * @param user - user member object
   * @param role - 'manager' or 'member'
   * @param groupId - current groupId
   */
  async changeGroupRole(user: any, role: string, groupId: string) {

    // Create a new User Service Object
    let groupService = this.injector.get(GroupService);

    // Create a new utility Service Object
    let utilityService = this.injector.get(UtilityService);

    if (role === 'manager') {
      const index = this.groupData._members.findIndex(member => member._id === user._id);

      if (index > -1) {
        this.groupData._members.splice(index, 1);
        this.groupData._admins.push(user);
      }
    } else if (role === 'member') {
      const index = this.groupData._admins.findIndex(admin => admin._id === user._id);

      if (index > -1) {
        this.groupData._admins.splice(index, 1);
        this.groupData._members.push(user);
      }
    }

    // Instatiate the request to change the role
    utilityService.asyncNotification('Please wait we are updating the role as per your request...',
      new Promise((resolve, reject) => {
        groupService.updateGroup(groupId, this.groupData)
          .then((res) => {
            // Send the data over the service and storage layer throughout the entire app
            this.publicFunctions.sendUpdatesToGroupData(this.groupData);

            // Resolve the promise with success
            resolve(utilityService.resolveAsyncPromise(`User updated to Group Manager!`))
          })
          .catch((err) => {
            console.log('Error occured, while updating the role', err);
            reject(utilityService.rejectAsyncPromise('Oops, an error occured while updating the role, please try again!'))
          })
      }))
  }

  /**
   * This function is responsible for opening a fullscreen dialog to see the member profile
   */
  openFullscreenModal(userId: string): void {
    this.utilityService.openFullscreenModal(userId);
  }

  /**
   * This function is responsible for opening a dialog to update User password.
   */
  openUpdatePasswordModal(member: any){
    const data = {
      userData: member,
    };

    this.dialog.open(UserUpdateProfileDialogComponent, {
      width: '460px',
      hasBackdrop: true,
      data: data
    });
  }
}
