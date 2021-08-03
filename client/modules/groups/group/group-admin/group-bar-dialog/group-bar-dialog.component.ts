import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-group-bar-dialog',
    templateUrl: './group-bar-dialog.component.html',
    styleUrls: ['./group-bar-dialog.component.scss']
  })
  export class GroupBarDialogComponent implements OnInit {
    constructor(
        private injector: Injector,
        private utilityService: UtilityService,
        private groupService: GroupService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private mdDialogRef: MatDialogRef<GroupBarDialogComponent>
        ) { }
    @Output() closeEvent = new EventEmitter();
      // Base Url of the users uploads
    userBaseUrl = environment.UTILITIES_USERS_UPLOADS;
    tag: string;
    barList: any = [];
    subSink = new SubSink();
    groupData: any;
    groupId: any;
    members: any[];
    barTag: string;
    membersLoaded = false;
    addNewBar = false;
    searchBarPlaceHolder= 'Add a member to tag';
    ngOnInit(): void {
        this.members = this.data.groupData._members;
        this.groupData = this.data.groupData;
        this.barList = this.groupData.bars;
        this.groupId = this.data.groupData._id;
        if(this.barList !== undefined){
            this.barList.forEach(bar => {
                bar.members = [];
                if (bar.tag_members !== undefined) {
                    bar.tag_members.forEach( tagMember =>{
                        this.members.forEach(member => {
                            if(member._id === tagMember)
                                bar.members.push(member);
                        });
                    });
                }
            });
        }
        this.membersLoaded = true;
    }

    addNewUserToBar(event, bar){
            // Add a new member to bar
        this.utilityService.asyncNotification($localize`:@@groupBarDialog.pleaseWaitAddingNewUserToBar:Please wait we are adding the new user to bar...`,
        new Promise((resolve, reject)=>{
        this.groupService.addMemberToBar(this.groupId, bar.bar_tag, event)
        .then(()=> {
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupBarDialog.addedToBar:${event.first_name} added to your bar!`))
            this.barList.forEach(barItem => {
                if(barItem.bar_tag === bar.bar_tag){
                    barItem.members.push(event);
                }
            });
        })
        .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupBarDialog.unableToAddToBar:Unable to add ${event.first_name} to your bar`)))
        }))
    }

    removeUserFromBar(event,bar){

        this.groupService.removeUserFromBar(this.groupId, bar.bar_tag, event)
        .then(()=> {
            this.utilityService.warningNotification($localize`:@@groupBarDialog.removedFromBarTag:${event.first_name} removed from ${bar.bar_tag}!`);
            this.barList.forEach( barItem => {
                if(barItem.bar_tag === bar.bar_tag){
                    barItem.members = barItem.members.filter(member => member._id !== event._id);
                    barItem.tag_members = barItem.tag_members.filter(memberId => memberId !== event._id);
                }
            });
        })
        .catch(() => this.utilityService.rejectAsyncPromise($localize`:@@groupBarDialog.unableToRemoveFromBarTag:Unable to remove ${event.first_name} from ${bar.bar_tag}`));
    }
    showTagComponent(){
        this.addNewBar = !this.addNewBar;
    }

    addTag(){
        this.groupService.addBar(this.groupData._id, this.tag).then((res: any)=>{
            this.data.groupData = res.group;
            this.barList = res.group.bars;
            this.barList.forEach(bar => {
                bar.members = [];
                bar.tag_members.forEach( tagMember =>{
                    this.members.forEach(member => {
                        if(member._id === tagMember)
                            bar.members.push(member);
                    });
                });
            });
        }).catch(() => {});
        this.tag = "";
        this.addNewBar = false;
    }

    removeTag(barTag) {
        this.groupService.removeBar(this.groupData._id, barTag).then((res: any)=>{
            this.data.groupData = res.group;
            this.barList = res.group.bars;
            this.barList.forEach(bar => {
                bar.members = [];
                bar.tag_members.forEach( tagMember =>{
                    this.members.forEach(member => {
                        if(member._id === tagMember)
                            bar.members.push(member);
                    });
                });
            });
        }).catch(() => {});
        this.tag = "";
        this.addNewBar = false;
    }

  onCloseDialog() {
    this.closeEvent.emit(this.barTag);
  }
}
