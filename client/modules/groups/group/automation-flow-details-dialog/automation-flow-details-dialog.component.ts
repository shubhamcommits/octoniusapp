import { Component, OnInit, Inject, Output, EventEmitter, OnDestroy, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import { environment } from 'src/environments/environment';
import { SubSink } from 'subsink';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';

@Component({
  selector: 'app-automation-flow-details-dialog',
  templateUrl: './automation-flow-details-dialog.component.html',
  styleUrls: ['./automation-flow-details-dialog.component.scss']
})
export class AutomationFlowDetailsDialogComponent implements OnInit, OnDestroy {

  @Output() flowNameChangeEmitter = new EventEmitter();
  @Output() deleteFlowEvent = new EventEmitter();

  flowSteps = [];

  groupId;
  flowId;
  groupSections = [];
  workspaceId;

  groupData;

  flowName = '';

  triggerOptions = ['Assigned to', 'Custom Field', 'Section is', 'Status is', 'Task is CREATED', 'Subtasks Status', 'Approval Flow is Completed', 'Due date is'];
  actionOptions = ['Assign to', 'Change Status to', 'Custom Field', 'Move to', 'Set Due date'];
  statusOptions = ['to do', 'in progress', 'done'];
  customFields = [];
  customFieldOptions = [];
  shuttleGroups = [];
  dueDateTriggerOptions = [
    { type: 'overdue', title: $localize`:@@automationFlowDetailsDialog.overdue:Overdue`},
    { type: 'tomorrow', title: $localize`:@@automationFlowDetailsDialog.tomorrow:Tomorrow`},
    { type: 'today', title: $localize`:@@automationFlowDetailsDialog.today:Today`}
  ];
  dueDateActionOptions = [
    { type: 'tomorrow', title: $localize`:@@automationFlowDetailsDialog.tomorrow:Tomorrow`},
    { type: 'end_of_week', title: $localize`:@@automationFlowDetailsDialog.endOfWeek:End of the Week`},
    { type: 'end_of_next_week', title: $localize`:@@automationFlowDetailsDialog.endOfNextWeek:End of Next Week`},
    { type: 'end_of_month', title: $localize`:@@automationFlowDetailsDialog.endOfMonth:End of the Month`}
  ];

  userData: any;

  isShuttleTasksModuleAvailable = false;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    public utilityService: UtilityService,
    private flowService: FlowService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<AutomationFlowDetailsDialogComponent>
  ) { }

  async ngOnInit() {
    this.groupId = this.data.groupId;
    this.flowId = this.data.flowId;
    this.groupSections = this.data.groupSections;
    this.workspaceId = this.data.workspaceId;
    this.customFields = this.data.customFields;
    this.shuttleGroups = this.data.shuttleGroups;

    this.customFields.forEach(cf => {
      if (!cf.input_type && !cf.input_type_number && !cf.input_type_text) {
        this.customFieldOptions.push(cf.name);
      }
    });

    this.isShuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable();

    if (this.isShuttleTasksModuleAvailable) {
      this.actionOptions.push('Shuttle task');
    }

    this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    if (this.groupData.enable_estimation) {
      this.actionOptions.push('Set Time Estimation to');
    }

    // GETTING USER DATA FROM THE SHARED SERVICE
    this.subSink.add(
      this.utilityService.currentUserData
        .subscribe(res => this.userData = res)
    );

    await this.flowService.getFlow(this.flowId).then((res) => {
      const flow = res['flow'];
      if (flow) {
        this.initFlowsSteps(flow.steps);
        this.flowName = flow.name;
      }
    });
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  onCloseDialog() {}

  getCustomFieldsValues(customFieldName) {
    const index = this.customFields.findIndex(cf => cf.name === customFieldName);
    return (index >= 0) ? this.customFields[index].values : [];
  }

  flowNameChange(event: any) {
    const newFlowName = event.target.value;
    if (newFlowName !== this.flowName) {
      this.utilityService.asyncNotification($localize`:@@automationFlowDetailsDialog.pleaseWaitUpdatingContents:Please wait we are updating the contents...`, new Promise(async (resolve, reject) => {
        await this.flowService.updateFlowName(this.flowId, newFlowName).then((res) => {
          this.flowName = newFlowName;

          this.flowNameChangeEmitter.emit({ flowId: this.flowId, flowName: this.flowName });

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@automationFlowDetailsDialog.flowNameUpdated:Flow Name updated!`));
        }).catch(err => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@automationFlowDetailsDialog.unableToUpdateFlowName:Unable to update the Flow Name, please try again!`));
        });
      }));
    }
  }

  createStep() {
    this.flowSteps.push({});
  }

  initFlowsSteps(steps: any) {
    this.flowSteps = [];
    if (steps) {
      steps.forEach(step => {
        step.newTrigger = false;
        step.newAction = false;
        this.flowSteps.push(step);
      });

      this.flowSteps = this.flowSteps?.filter((step) => {
        return step.action.findIndex(action => action.name == 'Shuttle task') < 0 || this.isShuttleTasksModuleAvailable;
      }).sort((s1, s2) => (s1.created_date > s2.created_date) ? 1 : -1);
    }
  }

  getStatusClass(status: string) {
    let retClass = '';
    if (status === 'to do') {
      retClass = 'status-todo';
    } else if (status === 'in progress') {
      retClass = 'status-inprogress';
    } else if (status === 'done') {
      retClass = 'status-done';
    }
    return retClass + ' badge-status' ;
  }

  /**
   * Call function to delete a step from the flow
   * @param stepId
   */
  removeStep(stepId) {
    if (!stepId) {
      this.flowSteps.splice((this.flowSteps.length - 1), 1);
    } else {
      this.utilityService.getConfirmDialogAlert()
        .then((result) => {
          if (result.value) {
            // Remove the file
            this.utilityService.asyncNotification($localize`:@@automationFlowDetailsDialog.pleaseWaitDeletingStep:Please wait we are deleting the flow step...`, new Promise((resolve, reject) => {
              const index = this.flowSteps.findIndex((s: any) => s._id === stepId);
              if (index !== -1) {
                // Remove the step
                this.flowService.removeFlowStep(stepId, this.flowId)
                  .then((res) => {
                    // Remove the field from the list
                    this.flowSteps.splice(index, 1);

                    resolve(this.utilityService.resolveAsyncPromise($localize`:@@automationFlowDetailsDialog.stepDeleted:Step deleted!`));
                  }).catch((err) => {
                    reject(this.utilityService.rejectAsyncPromise($localize`:@@automationFlowDetailsDialog.unableToDeleteStep:Unable to delete step, please try again!`));
                  });
              }
            }));
          }
        });
    }
  }

  selectTrigger(trigger: string, stepIndex: number) {
    if (!this.flowSteps[stepIndex].trigger) {
      this.flowSteps[stepIndex].trigger = [];
    }
    this.flowSteps[stepIndex].trigger.push({ name: trigger });

    this.flowSteps[stepIndex].newTrigger = false;
  }

  selectAction(action: string, stepIndex: number) {
    if (!this.flowSteps[stepIndex].action) {
      this.flowSteps[stepIndex].action = [];
    }
    this.flowSteps[stepIndex].action.push({ name: action });

    this.flowSteps[stepIndex].newAction = false;
  }

  getMember(event: any, type: string, stepIndex: number, index: number) {
    if (type === 'trigger') {
      if (!this.flowSteps[stepIndex].trigger[index]._user) {
        this.flowSteps[stepIndex].trigger[index]._user = [];
      }
      this.flowSteps[stepIndex].trigger[index]._user.push(event['assignee']);
    }

    if (type === 'action') {
      if (!this.flowSteps[stepIndex].action[index]._user) {
        this.flowSteps[stepIndex].action[index]._user = [];
      }
      this.flowSteps[stepIndex].action[index]._user.push(event['assignee']);
      this.saveStep(this.flowSteps[stepIndex]);
    }
  }

  removeMember(event: any, type: string, stepIndex: number, index: number) {
    if (type === 'trigger') {
      const assigneeIndex = this.flowSteps[stepIndex].trigger[index]._user.findIndex(user => user._id == event['assigneeId']);
      this.flowSteps[stepIndex].trigger[index]._user.splice(assigneeIndex, 1);
      if (this.flowSteps[stepIndex]._id) {
        this.saveStep(this.flowSteps[stepIndex]);
      }
    }

    if (type === 'action') {
      const assigneeIndex = this.flowSteps[stepIndex].action[index]._user.findIndex(user => user._id == event['assigneeId']);
      this.flowSteps[stepIndex].action[index]._user.splice(assigneeIndex, 1);
      this.saveStep(this.flowSteps[stepIndex]);
    }
  }

  customFieldNameTriggerSelected(cf: string, stepIndex: number, triggerIndex: number) {
    const custom_field = {
      name: cf
    }
    this.flowSteps[stepIndex].trigger[triggerIndex].custom_field = custom_field;
  }

  triggerSelected(type: string, value: string, stepIndex: number, triggerIndex: number) {
    switch (type) {
      case 'cf':
        this.flowSteps[stepIndex].trigger[triggerIndex].custom_field.value = value;
        break;

      case 'status':
        this.flowSteps[stepIndex].trigger[triggerIndex].status = value;
        break;

      case 'subtaskStatus':
        this.flowSteps[stepIndex].trigger[triggerIndex].subtaskStatus = value;
        break;

      case 'section':
        this.flowSteps[stepIndex].trigger[triggerIndex]._section = (value['_id'] || value);
        break;

      case 'set_due_date':
        this.flowSteps[stepIndex].trigger[triggerIndex].due_date_value = value;
        break;

      default:
        break;
    }

    this.saveStep(this.flowSteps[stepIndex]);
  }

  customFieldNameActionSelected(cf: string, stepIndex: number, actionIndex: number) {
    const custom_field = {
      name: cf
    }
    this.flowSteps[stepIndex].action[actionIndex].custom_field = custom_field;
  }

  actionSelected(type: string, value: any, stepIndex: number, actionIndex: number) {
    switch (type) {
      case 'cf':
        this.flowSteps[stepIndex].action[actionIndex].custom_field.value = value;
        break;

      case 'status':
        this.flowSteps[stepIndex].action[actionIndex].status = value;
        break;

      case 'section':
        this.flowSteps[stepIndex].action[actionIndex]._section = (value['_id'] || value);
        break;

      case 'shuttle':
        this.flowSteps[stepIndex].action[actionIndex]._shuttle_group = (value['_id'] || value);
        break;

      case 'set_due_date':
        this.flowSteps[stepIndex].action[actionIndex].due_date_value = value;
        break;

      case 'estimation':
        this.flowSteps[stepIndex].action[actionIndex].estimation = value;
        break;

      default:
        break;
    }

    this.saveStep(this.flowSteps[stepIndex]);
  }

  saveStep(step: any) {
    this.utilityService.asyncNotification($localize`:@@automationFlowDetailsDialog.pleaseWaitUpdatingStep:Please wait we are updating the step...`, new Promise(async (resolve, reject) => {
      await this.flowService.saveStep(this.flowId, step).then((res) => {
        this.initFlowsSteps(res['flow']['steps']);

        resolve(this.utilityService.resolveAsyncPromise($localize`:@@automationFlowDetailsDialog.stepSaved:Step saved!`));
      }).catch(err => {
        reject(this.utilityService.rejectAsyncPromise($localize`:@@automationFlowDetailsDialog.unableToSaveStep:Unable to save the step, please try again!`));
      });
    }));
  }

  /**
   * Call function to delete flow
   */
  deleteFlow() {
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          // Remove the file
          this.utilityService.asyncNotification($localize`:@@automationFlowDetailsDialog.pleaseWaitDeletingFlow:Please wait we are deleting the flow...`, new Promise((resolve, reject) => {
            this.flowService.deleteFlow(this.flowId)
              .then((res) => {
                // Emit the Deleted post to all the compoents in order to update the UI
                this.deleteFlowEvent.emit(this.flowId);
                // Close the modal
                this.mdDialogRef.close();

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@automationFlowDetailsDialog.flowDeleted:Flow deleted!`));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@automationFlowDetailsDialog.unableToDeleteFlow:Unable to delete flow, please try again!`));
              });
          }));
        }
      });
  }

  getTriggerDueDateIndex(dueDateValue: string) {
    return this.dueDateTriggerOptions.findIndex(dd => dd.type == dueDateValue);
  }

  getActionDueDateIndex(dueDateValue: string) {
    return this.dueDateActionOptions.findIndex(dd => dd.type == dueDateValue);
  }

  formateDate(date){
    return moment(moment.utc(date), "YYYY-MM-DD").toDate();
  }
}
