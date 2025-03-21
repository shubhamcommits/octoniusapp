import { Component, OnInit, Inject } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import { AutomationFlowDetailsDialogComponent } from './automation-flow-details-dialog/automation-flow-details-dialog.component';

@Component({
  selector: 'app-automation-flows-dialog',
  templateUrl: './automation-flows-dialog.component.html',
  styleUrls: ['./automation-flows-dialog.component.scss']
})
export class AutomationFlowsDialogComponent implements OnInit {

  automationFlows = [];

  groupId;
  groupSections = [];
  workspaceId;
  customFields = [];
  shuttleGroups = [];

  constructor(
    public utilityService: UtilityService,
    private flowService: FlowService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  async ngOnInit() {
    this.groupId = this.data.groupId;
    this.groupSections = this.data.groupSections;
    this.workspaceId = this.data.workspaceId;
    this.customFields = this.data.customFields;
    this.shuttleGroups = this.data.shuttleGroups;

    await this.flowService.getGroupAutomationFlows(this.groupId).then((res) => {
      res['flows'].forEach(flow => {
        this.automationFlows.push(flow);
      });
    });
  }

  createFlow() {
    this.utilityService.asyncNotification($localize`:@@automationFlowsDialog.pleaseWaitupdatingContent:Please wait we are updating the contents...`, new Promise(async (resolve, reject) => {
      await this.flowService.createNewAutomationFlow(this.groupId).then((res) => {
        this.automationFlows.push(res['flow']);
        this.automationFlows.sort((f1, f2) => (f1.name > f2.name) ? 1 : -1);

        resolve(this.utilityService.resolveAsyncPromise($localize`:@@automationFlowsDialog.automationFlowCreated:Automation Flow created!`));
      }).catch(err => {
        reject(this.utilityService.rejectAsyncPromise($localize`:@@automationFlowsDialog.unableToCreateAutomationFlow:Unable to create the new Automation Flow, please try again!`));
      });
    }));
  }

  openFlowDetailsDialog(flowId: string) {
    const dialogRef = this.dialog.open(AutomationFlowDetailsDialogComponent, {
      minWidth: '100%',
      width: '100%',
      minHeight: '100%',
      height: '100%',
      disableClose: true,
      data: {
        groupId: this.groupId,
        flowId: flowId,
        groupSections: this.groupSections,
        workspaceId: this.workspaceId,
        customFields: this.customFields,
        shuttleGroups: this.shuttleGroups
      }
    });
    const subFlowNameChangeEmitter = dialogRef.componentInstance.flowNameChangeEmitter.subscribe((data) => {
      const flowIndex = this.automationFlows.findIndex(flow => flow._id === data['flowId']);
      this.automationFlows[flowIndex].name = data['flowName'];
      this.automationFlows.sort((f1, f2) => (f1.name > f2.name) ? 1 : -1);
    });
    const subDeleteFlowEmitter = dialogRef.componentInstance.deleteFlowEvent.subscribe((data) => {
      const flowIndex = this.automationFlows.findIndex(flow => flow._id === data);
      this.automationFlows.splice(flowIndex, 1);
    });
    dialogRef.afterClosed().subscribe(result => {
      subFlowNameChangeEmitter.unsubscribe();
      subDeleteFlowEmitter.unsubscribe();
    });
  }
}
