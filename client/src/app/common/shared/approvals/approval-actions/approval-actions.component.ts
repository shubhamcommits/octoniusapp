import { Component, Input, Output, OnChanges, EventEmitter, ViewChild, ViewEncapsulation, Injector, OnInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApprovalService } from 'src/shared/services/approval-service/approval.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-approval-actions',
  templateUrl: './approval-actions.component.html',
  styleUrls: ['./approval-actions.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ApprovalActionsComponent implements OnChanges, OnInit {

  @Input() groupId;
  @Input() userData;
  @Input() itemData: any; // this could be a file or a post
  @Input() type; // post/file
  @Input() canEdit = true;

  @Output() assigneeEmiter = new EventEmitter();
  @Output() approvalFlowLaunchedEmiter = new EventEmitter();

  @ViewChild(MatMenuTrigger, {static: true}) trigger: MatMenuTrigger;

  searchText = '';
  groupMembers = [];

  groupData;

  showApproveCode: boolean = false;
  showDescription: boolean = false;
  confirmationCode: string = "";
  confirmation: string = "";

  descriptionPlaceholder = 'Desctiption';
  codePlaceholder = 'Code';

  flowCompleted: boolean = false;

  today = moment().startOf('day').format('YYYY-MM-DD');

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Subsink Object
  subSink = new SubSink();

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    private approvalService: ApprovalService,
    public utilityService: UtilityService,
    private injector: Injector
  ) { }

  async ngOnChanges() {

    this.subSink.add(this.utilityService.currentGroupData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;

        this.groupMembers = this.groupData._members.concat(this.groupData._admins);
        this.groupMembers = this.groupMembers.filter((member, index) => {
            return (this.groupMembers.findIndex(m => m._id == member._id) == index)
        });

        this.groupMembers.unshift({_id: 'all', first_name: 'All', last_name: 'members', email: ''});
      }
    }));

    if (!this.itemData?.approval_flow) {
      this.itemData.approval_flow = [];
    } else {
      if (this.itemData) {
        this.flowCompleted = await this.isApprovalFlowCompleted();
      }
    }
  }

  async ngOnInit() {
    this.codePlaceholder = $localize`:@@approvalActions.code:Code`;
    this.descriptionPlaceholder = $localize`:@@approvalActions.description:Description`;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

  activateApprovalFlow() {
    // Start the loading spinner
    this.isLoading$.next(true);

    this.approvalService.activateApprovalForItem(this.itemData._id, !this.itemData.approval_active, this.type).then(res => {
      this.itemData.approval_active = !this.itemData.approval_active;

      if (!this.itemData.approval_active) {
        this.itemData.approval_due_date = null;
        this.itemData.approval_flow = [];
        this.itemData.approval_flow_launched = false;
      }

      // Return the function via stopping the loader
      this.isLoading$.next(false);
    }).catch(err => {
      this.utilityService.errorNotification(err.error.message);

      // Return the function via stopping the loader
      this.isLoading$.next(false);
    });
  }

  unassign(approvalId: string) {
    if (this.canEdit) {
      // Start the loading spinner
      this.isLoading$.next(true);

      const index = (this.itemData.approval_flow) ? this.itemData.approval_flow.findIndex((approval) => approval?._id == approvalId) : -1;
      this.approvalService.removeUserFromFlow(this.itemData?._id, this.type, approvalId).then(res => {
        this.itemData.approval_flow.splice(index, 1);
        this.assigneeEmiter.emit(this.itemData);

        // Return the function via stopping the loader
        this.isLoading$.next(false);
      }).catch(err => {
        this.utilityService.errorNotification(err.error.message);

        // Return the function via stopping the loader
        this.isLoading$.next(false);
      });
    }
  }

  getMemberDetails(selectedMember: any) {
    // Start the loading spinner
    this.isLoading$.next(true);

    let assignees = [];

    if (selectedMember._id == 'all') {
      assignees = this.groupMembers.filter((member)=> {
        return member._id != 'all';
      });
    } else {
      assignees = [selectedMember];
    }

    if (!this.itemData.approval_flow) {
      this.itemData.approval_flow = [];
    }
    assignees.forEach(member => {
      const index = this.itemData.approval_flow.findIndex((approval) => approval?.assigned_to?._id == member._id);
      if (index < 0) {
        this.approvalService.addUserToFlow(this.itemData?._id, this.type, member._id).then(res => {
          this.itemData = res['item'];

          // Return the function via stopping the loader
          this.isLoading$.next(false);
        }).catch(err => {
          this.utilityService.errorNotification(err.error.message);

          // Return the function via stopping the loader
          this.isLoading$.next(false);
        });
      }
    });

    this.assigneeEmiter.emit(this.itemData);
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any) {
    if (dateObject) {
      this.itemData.approval_due_date = moment(dateObject.toDate()).hours(12).format('YYYY-MM-DD');
    } else {
      this.itemData.approval_due_date = null;
    }

    this.utilityService.asyncNotification($localize`:@@approvalActions.pleaseWaitWeSaveDate:Please wait we are saving the date...`, new Promise((resolve, reject) => {
      this.approvalService.saveDueDate(this.itemData?._id, this.type, this.itemData.approval_due_date)
        .then((res) => {
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@approvalActions.projectSaved:Date Saved!`));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@approvalActions.unableToSAveProject:Unable to save the date at the moment, please try again!`))
        });
    }));
  }

  launchApprovalFlow() {
    this.utilityService.getConfirmDialogAlert($localize`:@@approvalActions.areYouSure:Are you sure?`, $localize`:@@approvalActions.launchFlowConfirmation:By doing this, the approval flow will be launched, and all assigned members will receive notifications!`)
      .then((res) => {
        if (res.value) {
          // Start the loading spinner
          this.isLoading$.next(true);

          this.approvalService.launchApprovalFlow(this.itemData._id, this.type, !this.itemData?.approval_flow_launched).then(res => {
            this.canEdit = false;
            this.itemData.approval_flow_launched = true;

            this.approvalFlowLaunchedEmiter.emit(this.itemData);

            // Return the function via stopping the loader
            this.isLoading$.next(false);
          }).catch(err => {
            this.utilityService.errorNotification(err.error.message);

            // Return the function via stopping the loader
            this.isLoading$.next(false);
          });
        }
      });
  }

  doAction(action: string, approvalId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@approvalActions.areYouSure:Are you sure?`, $localize`:@@approvalActions.actionConfirmation:By doing this, the item will be ${action}!`)
      .then((res) => {
        if (res.value) {
          // Start the loading spinner
          this.isLoading$.next(true);

          this.confirmationCode = '';
          this.confirmation = '';

          if (action == 'approved') {
            this.approvalService.approveItem(this.itemData._id, this.type, approvalId).then(res => {
              const index = (this.itemData.approval_flow) ? this.itemData.approval_flow.findIndex((approval) => approval?._id == approvalId) : -1;
              this.showApproveCode = true;
              this.showDescription = false;

              // Return the function via stopping the loader
              this.isLoading$.next(false);
            }).catch(err => {
              this.utilityService.errorNotification(err.error.message);

              // Return the function via stopping the loader
              this.isLoading$.next(false);
            });
          } else if (action == 'rejected') {
            const index = (this.itemData.approval_flow) ? this.itemData.approval_flow.findIndex((approval) => approval?._id == approvalId) : -1;
            this.showApproveCode = false;
            this.showDescription = true;

            // Return the function via stopping the loader
            this.isLoading$.next(false);
          }
        }
      });
  }

  async confirmAction(action: string, approvalId: string) {
    // Start the loading spinner
    this.isLoading$.next(true);

    if (action == 'approved') {
      if (this.confirmationCode && this.confirmationCode != '') {
        const isShuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable();
        this.approvalService.confirmAction(this.itemData._id, this.type, approvalId, this.confirmationCode, this.confirmation, isShuttleTasksModuleAvailable).then(async res => {
          this.itemData = res['item'];
          this.showApproveCode = false;
          this.showDescription = false;
          this.confirmationCode = '';
          this.confirmation = '';
          if (this.itemData) {
            this.flowCompleted = await this.isApprovalFlowCompleted();
          }
          this.approvalFlowLaunchedEmiter.emit(this.itemData);

          // Return the function via stopping the loader
          this.isLoading$.next(false);
        }).catch(err => {
          this.utilityService.errorNotification(err.error.message);

          // Return the function via stopping the loader
          this.isLoading$.next(false);
        });
      } else {
        this.utilityService.errorNotification($localize`:@@approvalActions.provideCode:Please provide the code sent to you.`);

        // Return the function via stopping the loader
        this.isLoading$.next(false);
      }
    } else if (action == 'rejected') {
      if (this.confirmation && this.confirmation != '') {
        this.approvalService.rejectItem(this.itemData._id, this.type, approvalId, this.confirmation).then(res => {
          this.itemData.approval_flow_launched = false;
          this.itemData.approval_flow = [];
          this.showApproveCode = false;
          this.showDescription = false;
          this.confirmationCode = '';
          this.confirmation = '';
          this.flowCompleted = false;
          this.itemData.approval_due_date = null;
          this.approvalFlowLaunchedEmiter.emit(this.itemData);

          // Return the function via stopping the loader
          this.isLoading$.next(false);
        }).catch(err => {
          this.utilityService.errorNotification(err.error.message);

          // Return the function via stopping the loader
          this.isLoading$.next(false);
        });
      } else {
        this.utilityService.errorNotification($localize`:@@approvalActions.provideReason:Please provide a reason to reject the item.`);

        // Return the function via stopping the loader
        this.isLoading$.next(false);
      }
    }
  }

  isApprovalFlowCompleted() {
    for (let i = 0; i < this.itemData?.approval_flow?.length; i++) {
      if (!this.itemData?.approval_flow[i].confirmed || !this.itemData?.approval_flow[i].confirmation_date) {
        return false;
      }
    }
    return true
  }

  formateDate(date) {
    return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }
}
