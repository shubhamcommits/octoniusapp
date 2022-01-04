import { Component, Input, Output, OnChanges, EventEmitter, ViewChild, ViewEncapsulation, Injector, OnInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { PublicFunctions } from 'modules/public.functions';
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
  confirmation: string = "";

  flowCompleted: boolean = false;

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Subsink Object
  subSink = new SubSink();

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

    if (!this.itemData.approval_flow) {
      this.itemData.approval_flow = [];
    } else {
      this.flowCompleted = await this.isApprovalFlowCompleted();
    }
  }

  async ngOnInit() {

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

  activateApprovalFlow() {
    this.approvalService.activateApprovalForItem(this.itemData._id, !this.itemData.approval_active, this.type).then(res => {
      this.itemData.approval_active = !this.itemData.approval_active;

      if (!this.itemData.approval_active) {
        this.itemData.approval_flow = [];
        this.itemData.approval_flow_launched = false;
      }
    });
  }

  unassign(approvalId: string) {
    if (this.canEdit) {
      const index = (this.itemData.approval_flow) ? this.itemData.approval_flow.findIndex((approval) => approval?._id == approvalId) : -1;
      this.approvalService.removeUserFromFlow(this.itemData?._id, this.type, approvalId).then(res => {
        this.itemData.approval_flow.splice(index, 1);
        this.assigneeEmiter.emit(this.itemData);
      });
    }
  }

  getMemberDetails(selectedMember: any) {
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
        });
      }
    });

    this.assigneeEmiter.emit(this.itemData);
  }

  launchApprovalFlow() {
    this.utilityService.getConfirmDialogAlert($localize`:@@approvalActions.areYouSure:Are you sure?`, $localize`:@@approvalActions.launchFlowConfirmation:By doing this, the approval flow will be launched, and all assigned members will receive notifications!`)
      .then((res) => {
        if (res.value) {
          this.approvalService.launchApprovalFlow(this.itemData._id, this.type, !this.itemData?.approval_flow_launched).then(res => {
            this.canEdit = false;
            this.itemData.approval_flow_launched = true;

            this.approvalFlowLaunchedEmiter.emit(this.itemData);
          });
        }
      });
  }

  doAction(action: string, approvalId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@approvalActions.areYouSure:Are you sure?`, $localize`:@@approvalActions.actionConfirmation:By doing this, the item will be ${action}!`)
      .then((res) => {
        if (res.value) {
          if (action == 'approved') {
            this.approvalService.approveItem(this.itemData._id, this.type, approvalId).then(res => {
              const index = (this.itemData.approval_flow) ? this.itemData.approval_flow.findIndex((approval) => approval?._id == approvalId) : -1;
              this.itemData.approval_flow[index].rejected = false;
              this.showApproveCode = true;
              this.showDescription = false;
            });
          } else if (action == 'rejected') {
            const index = (this.itemData.approval_flow) ? this.itemData.approval_flow.findIndex((approval) => approval?._id == approvalId) : -1;
            this.itemData.approval_flow[index].rejected = true;
            this.showApproveCode = false;
            this.showDescription = true;
          }
        }
      });
  }

  confirmAction(action: string, approvalId: string) {
    if (this.confirmation && this.confirmation != '') {
      if (action == 'approved') {
        this.approvalService.confirmAction(this.itemData._id, this.type, approvalId, this.confirmation).then(async res => {
          this.itemData = res['item'];
          this.showApproveCode = false;
          this.showDescription = false;
          this.confirmation = '';
          this.flowCompleted = await this.isApprovalFlowCompleted();
        });
      } else if (action == 'rejected'){
        this.approvalService.rejectItem(this.itemData._id, this.type, approvalId, this.confirmation).then(res => {
          this.itemData.approval_flow_launched = false;
          this.itemData.approval_flow = [];
          this.showApproveCode = false;
          this.showDescription = false;
          this.confirmation = '';
          this.flowCompleted = false;
          this.approvalFlowLaunchedEmiter.emit(this.itemData);
        });
      }
    } else {
      if (action == 'approved') {
        this.utilityService.errorNotification($localize`:@@approvalActions.areYouSure:Please provide the code sent to you.`);
      } else if (action == 'rejected') {
        this.utilityService.errorNotification($localize`:@@approvalActions.areYouSure:Please provide a reason to reject the item.`);
      }
    }
  }

  isApprovalFlowCompleted() {
    for (let i = 0; i < this.itemData.approval_flow.length; i++) {
      if (!this.itemData.approval_flow[i].confirmed || !this.itemData.approval_flow[i].confirmation_date) {
        return false;
      }
    }
    return true
  }
}
