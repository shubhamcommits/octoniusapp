import { Component, OnInit, Injector } from '@angular/core';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
// import { PublicFunctions } from 'src/app/dashboard/public.functions';

@Component({
  selector: 'app-pulse',
  templateUrl: './pulse.component.html',
  styleUrls: ['./pulse.component.scss']
})
export class PulseComponent implements OnInit {

  constructor(
    private groupService: GroupsService,
    private injector: Injector
  ) { }

  // PULSE GROUPS
  public pulseGroups: any = [];

  // PUBLIC FUNCTIONS
  // publicFunctions = new PublicFunctions(this.injector);

  // WORKSPACE DATA
  workspaceData: Object = {};

  async ngOnInit() {
    // this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.pulseGroups = await this.getAllPulseGroups(this.workspaceData['_id'])
    console.log(this.pulseGroups);
  }


  /**
   * This function is resposible for fetching first 10 groups present in the workplace
   * @param workspaceId 
   */
  public async getAllPulseGroups (workspaceId: string) {
    return new Promise((resolve, reject)=>{
      this.groupService.getPulseGroups(workspaceId)
      .then((res)=> resolve(res['groups']))
      .catch(()=> reject([]))
    })
  }

  /**
   * This function is resposible for fetching next 5 groups present in the workplace
   * @param workspaceId 
   * @param lastGroupId 
   */
  public async getNextPulseGroups(workspaceId: string, lastGroupId: string){
    return new Promise((resolve, reject)=>{
      this.groupService.getNextPulseGroups(workspaceId, lastGroupId)
      .then((res)=> resolve(res['groups']))
      .catch(()=> reject([]))
    })
  }


}
