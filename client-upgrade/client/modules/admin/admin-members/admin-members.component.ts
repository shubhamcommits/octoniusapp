import { Component, OnInit, Injector } from '@angular/core';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/shared/services/user-service/user.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';

@Component({
  selector: 'app-admin-members',
  templateUrl: './admin-members.component.html',
  styleUrls: ['./admin-members.component.scss']
})
export class AdminMembersComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private injector: Injector,
    private userService: UserService,
    private socketService: SocketService
  ) { }

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // MEMBERS LIST
  public members: any = [];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // BASE URL OF THE APPLICATION
  public baseUrl = environment.UTILITIES_BASE_URL;

  // PLACEHOLDER INPUT FOR SEARCH BAR
  public searchBarPlaceholder = "Whom you are looking for?";

  // WORKSPACE DATA
  public workspaceData: any;

  async ngOnInit() {

    // Subscribe to the change in workspace data from the socket server
    this.subSink.add(this.utilityService.currentWorkplaceData.subscribe((res) => {
      if (res != {}) {
        this.workspaceData = res;
        this.members = this.workspaceData.members;
      }
    }));

    // Fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Initialise the members
    this.members = await this.workspaceData.members;

  }

  async changeRole(userId: string, role: string, index: number) {
    this.utilityService.asyncNotification('Please wait we are updating the role as per your request...',
      new Promise((resolve, reject) => {
        this.userService.updateUserRole(userId, role)
          .then((res) => {

            // Update the current member role
            this.members[index].role = role;

            // Update the current workspace data with updated list of members
            this.workspaceData.members = this.members;

            // Send the data over the service and storage layer throughout the entire app
            this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);

            // Update the localdata of all the connected users 
            this.publicFunctions.emitWorkspaceData(this.socketService, this.workspaceData)

            // Updates the local data of the user to tell them about that their role has been updated
            this.publicFunctions.emitUserData(this.socketService, this.members[index]['_id'], this.members[index]);

            // Resolve the promise with success
            resolve(this.utilityService.resolveAsyncPromise(`User updated to ${role}!`))
          })
          .catch((err) => {
            console.log('Error occured, while updating the role', err);
            reject(this.utilityService.rejectAsyncPromise('Oops, an error occured while updating the role, please try again!'))
          })
      }))
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

}
