import { Component, OnInit, Injector, Input } from '@angular/core';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-send-pulse',
  templateUrl: './send-pulse.component.html',
  styleUrls: ['./send-pulse.component.scss']
})
export class SendPulseComponent implements OnInit {

  constructor(public injector: Injector) { }

  // Pulse description variable
  pulseDescription: string = '';

  // GroupId variable
  @Input('groupId') groupId: string;

  ngOnInit() {
  }

  /**
   * This function updates the pulse data
   * @param pulseDescription
   */
  onClickSendPulse(pulseDescription: string){

    // Call the Helper Function to send the pulse
    this.sendPulse(pulseDescription)

    // Empty the variable
    this.pulseDescription = ""
  }

  /**
   * This function is responsible for sending the updated pulse data for this week
   * @param pulseDescription
   */
  sendPulse(pulseDescription: string){

    // Create Group Service Instance
    let groupsService = this.injector.get(GroupsService);

    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService);

    // Asynchronously Handling the the promise
    utilityService.asyncNotification($localize`:@@sendPulse.pleaseWaitSendingPulse:Please wait we are sending the pulse...`,
    new Promise((resolve, reject)=>{

      // Call pulse service function
      groupsService.sendPulse(this.groupId, pulseDescription)
      .then((res)=>{

        // Resolve the promise
        resolve(utilityService.resolveAsyncPromise($localize`:@@sendPulse.pulseUpdated:Pulse for the current week is updated!`))
      })
      .catch(()=>{

        // If there's an error, catch and reject it
        reject(utilityService.rejectAsyncPromise($localize`:@@sendPulse.unableToUpdatePulse:Unable to update the pulse, please try again!`))
      })
    }))

  }

}
