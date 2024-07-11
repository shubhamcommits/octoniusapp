import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';

@Component({
    selector: 'app-group-rag-dialog',
    templateUrl: './group-rag-dialog.component.html',
    styleUrls: ['./group-rag-dialog.component.scss']
  })
  export class GroupRAGDialogComponent implements OnInit {

    @Output() closeEvent = new EventEmitter();

    tag: string;
    ragList: any = [];
    subSink = new SubSink();
    groupData: any;
    groupId: any;
    members: any[];
    ragTag: string;
    membersLoaded = false;
    addNewRag = false;
    searchRagPlaceHolder= 'Add a member to tag';

    ragRights = [
      { _id: 'view', title: 'View' },
      { _id: 'hide', title: 'Hide' },
      { _id: 'edit', title: 'Edit' }
    ];

    // PUBLIC FUNCTIONS
    public publicFunctions = new PublicFunctions(this.injector);
    constructor(
        public utilityService: UtilityService,
        private injector: Injector,
        private groupService: GroupService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private mdDialogRef: MatDialogRef<GroupRAGDialogComponent>
        ) { }

    ngOnInit(): void {
        this.members = this.data.groupData._members;
        this.groupData = this.data.groupData;
        this.ragList = this.groupData.rags;
        this.groupId = this.data.groupData._id;
        this.membersLoaded = true;
    }

    addNewUserToRag(event, rag){
        // Add a new member to rag
        this.utilityService.asyncNotification($localize`:@@groupRagDialog.pleaseWaitAddingNewUserToRag:Please wait we are adding the new user to rag...`,
        new Promise((resolve, reject)=>{
        this.groupService.addMemberToRag(this.groupId, rag.rag_tag, event)
          .then((res: any)=> {
            this.ragList.forEach(ragItem => {
                if(ragItem.rag_tag === rag.rag_tag){
                    ragItem._members.push(event);
                }
            });

            this.groupData = res.group;
            this.groupData.rags = this.ragList;
            this.publicFunctions.sendUpdatesToGroupData(this.groupData);

            resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupRagDialog.addedToRag:${event.first_name} added to your rag!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupRagDialog.unableToAddToRag:Unable to add ${event.first_name} to your rag`)))
        }));
    }

    removeUserFromRag(event,rag){
      this.utilityService.asyncNotification($localize`:@@groupRagDialog.pleaseWaitRemovingUserToRag:Please wait we are removing the user from rag...`,
        new Promise((resolve, reject) => {
          this.groupService.removeUserFromRag(this.groupId, rag.rag_tag, event)
            .then((res) => {
                resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupRagDialog.removedFromRagTag:${event.first_name} removed from ${rag.rag_tag}!`));
                this.ragList.forEach( ragItem => {
                    if(ragItem.rag_tag == rag.rag_tag) {
                      ragItem._members = ragItem._members.filter(member => (member?._id || member) !== event._id);
                    }
                });

                this.groupData.rags = this.ragList;
                this.publicFunctions.sendUpdatesToGroupData(this.groupData);
            })
            .catch((err) => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupRagDialog.unableToRemoveFromRagTag:Unable to remove ${event.first_name} from ${rag.rag_tag}`)));
        }));
    }
    showTagComponent(){
        this.addNewRag = !this.addNewRag;
    }

    addTag() {
        this.groupService.addRag(this.groupData._id, this.tag).then((res: any) => {
            this.ragList = res.group.rags;
            this.groupData = res.group;
            this.groupData.rags = this.ragList;
            this.publicFunctions.sendUpdatesToGroupData(this.groupData);
        }).catch(() => {});
        this.tag = "";
        this.addNewRag = false;
    }

    removeTag(ragTag) {
        this.groupService.removeRag(this.groupData._id, ragTag).then((res: any)=>{
            this.ragList = res.group.rags;
            this.groupData = res.group;
            this.groupData.rags = this.ragList;
            this.publicFunctions.sendUpdatesToGroupData(this.groupData);
        }).catch(() => {});
        this.tag = "";
        this.addNewRag = false;
    }

  onCloseDialog() {
    this.closeEvent.emit(this.ragTag);
  }
}
