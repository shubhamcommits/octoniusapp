import { Component, OnInit, Injector, Input } from '@angular/core';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-project-status',
  templateUrl: './project-status.component.html',
  styleUrls: ['./project-status.component.scss']
})
export class ProjectStatusComponent implements OnInit {

  constructor(public injector: Injector) { }

  // GroupId variable
  @Input() groupId: string;

  status_types = ['NOT STARTED', 'ON TRACK', 'IN DANGER', 'ACHIEVED'];

  private publicFunctions = new PublicFunctions(this.injector);
  // Status description variable
  status: string = '';

  status_class = '';

  async ngOnInit() {
    // Create Group Service Instance
    let currentGroup;
    currentGroup = await this.publicFunctions.getCurrentGroupDetails(this.groupId);
    this.status = currentGroup['project_status'];
    this.setStatusClass(this.status);
  }

  changeStatus(status) {
    const newStatus = status.value;
    this.setStatusClass(status.value);
    this.status = newStatus;

    this.updateStatus();
  }

  setStatusClass(status) {
    if (status === 'NOT STARTED') {
      this.status_class = 'not_started';
    } else if (status === 'ON TRACK') {
      this.status_class = 'on_track';
    } else if (status === 'IN DANGER') {
      this.status_class = 'in_danger';
    } else if (status === 'ACHIEVED') {
      this.status_class = 'achieved';
    }
  }

  updateStatus() {
    // Call the Helper Function to send the status
    // Create Group Service Instance
    let groupsService = this.injector.get(GroupsService);

    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService);

    // Asynchronously Handling the the promise
    utilityService.asyncNotification($localize`:@@projectStatus.pleaseWaitSendingStatus:Please wait we are sending the status...`,
    new Promise((resolve, reject)=>{

      // Call status service function
      groupsService.sendProjectStatus(this.groupId, this.status)
        .then((res)=>{

          // Resolve the promise
          resolve(utilityService.resolveAsyncPromise($localize`:@@projectStatus.statusProjectUpdated:Status for the current project is updated!`))
        })
        .catch(()=>{

          // If there's an error, catch and reject it
          reject(utilityService.rejectAsyncPromise($localize`:@@projectStatus.unableToUpdateStatus:Unable to update the status, please try again!`))
        });
    }))
  }

}
