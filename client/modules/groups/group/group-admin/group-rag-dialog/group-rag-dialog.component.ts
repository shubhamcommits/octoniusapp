import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';

@Component({
    selector: 'app-group-rag-dialog',
    templateUrl: './group-rag-dialog.component.html',
    styleUrls: ['./group-rag-dialog.component.scss']
  })
  export class GroupRAGDialogComponent implements OnInit {

    @Output() closeEvent = new EventEmitter();

      // Base Url of the users uploads
    userBaseUrl = environment.UTILITIES_USERS_UPLOADS;
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
      { _id: 'edit', title: 'Edit' },
      { _id: 'delete', title: 'Delete' }
    ];

    // PUBLIC FUNCTIONS
    public publicFunctions = new PublicFunctions(this.injector);
    constructor(
        private injector: Injector,
        private utilityService: UtilityService,
        private groupService: GroupService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private mdDialogRef: MatDialogRef<GroupRAGDialogComponent>
        ) { }

    ngOnInit(): void {
        this.members = this.data.groupData._members;
        this.groupData = this.data.groupData;
        this.ragList = this.groupData.rags;
        this.groupId = this.data.groupData._id;
        if(this.ragList !== undefined){
            this.ragList.forEach(rag => {
                rag.members = [];
                if (rag.tag_members !== undefined) {
                    rag.tag_members.forEach( tagMember =>{
                        this.members.forEach(member => {
                            if(member._id === tagMember)
                                rag.members.push(member);
                        });
                    });
                }
            });
        }
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
                    ragItem.members.push(event);
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
        this.groupService.removeUserFromRag(this.groupId, rag.rag_tag, event)
        .then(()=> {
            this.utilityService.warningNotification($localize`:@@groupRagDialog.removedFromRagTag:${event.first_name} removed from ${rag.rag_tag}!`);
            this.ragList.forEach( ragItem => {
                if(ragItem.rag_tag === rag.rag_tag){
                    ragItem.members = ragItem.members.filter(member => member._id !== event._id);
                    ragItem.tag_members = ragItem.tag_members.filter(memberId => memberId !== event._id);
                }
            });

            this.groupData.rags = this.ragList;
            this.publicFunctions.sendUpdatesToGroupData(this.groupData);
        })
        .catch(() => this.utilityService.rejectAsyncPromise($localize`:@@groupRagDialog.unableToRemoveFromRagTag:Unable to remove ${event.first_name} from ${rag.rag_tag}`));
    }
    showTagComponent(){
        this.addNewRag = !this.addNewRag;
    }

    addTag() {
        this.groupService.addRag(this.groupData._id, this.tag).then((res: any) => {
            this.ragList = res.group.rags;
            this.ragList.forEach(rag => {
                rag.members = [];
                rag.tag_members.forEach( tagMember =>{
                    this.members.forEach(member => {
                        if(member._id === tagMember)
                            rag.members.push(member);
                    });
                });
            });

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
            this.ragList.forEach(rag => {
                rag.members = [];
                rag.tag_members.forEach( tagMember =>{
                    this.members.forEach(member => {
                        if(member._id === tagMember)
                            rag.members.push(member);
                    });
                });
            });

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

  selectRAGRights(rag: any, rightId: string) {
    // Change right to the RAG
    this.utilityService.asyncNotification($localize`:@@groupRagDialog.pleaseWaitChangingRAGRight:Please wait we are updating the right of the RAG...`,
    new Promise((resolve, reject)=>{
    this.groupService.selectRAGRights(this.groupId, rag._id, rightId)
      .then((res: any)=> {
        this.groupData = res['group'];
        this.publicFunctions.sendUpdatesToGroupData(this.groupData);
        resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupRagDialog.ragUpdated:RAG updated!`));
      })
      .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupRagDialog.unableToUpdateRag:Unable to update your RAG`)));
    }));
  }
}
