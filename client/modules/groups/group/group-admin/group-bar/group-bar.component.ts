import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-group-bar',
    templateUrl: './group-bar.component.html',
    styleUrls: ['./group-bar.component.scss']
  })
  export class GroupBarComponent implements OnInit {
    constructor(
        private injector: Injector,
        private utilityService: UtilityService,
        private groupService: GroupService, 
        @Inject(MAT_DIALOG_DATA) public data: any,
        private mdDialogRef: MatDialogRef<GroupBarComponent>
        ) { }
    @Output() closeEvent = new EventEmitter();

    barList: any = [];
    subSink = new SubSink();
    groupData: any;
    groupId: any;
    members: unknown[];
    barTag: string;
    membersLoaded = false;
    searchBarPlaceHolder= 'Add a member to tag';
    ngOnInit(): void {      
        this.members = this.data.groupData._members;
        this.groupData = this.data.groupData;
        this.barList = this.groupData.bars;
        this.groupId = this.data.groupData._id;
        this.barList.forEach(bar => {
            bar.members = [];
            bar.tag_members.forEach( tagMember =>{
                this.members.forEach(member => {
                    if(member._id === tagMember)
                        bar.members.push(member);
                });
            });
        });
        this.membersLoaded = true;
    }

    addNewUserToBar(event, bar){
            // Add a new member to bar
        this.utilityService.asyncNotification('Please wait we are adding the new user to your group...',
        new Promise((resolve, reject)=>{
        this.groupService.addMemberToBar(this.groupId, bar.bar_tag, event)
        .then(()=> {
            resolve(this.utilityService.resolveAsyncPromise(`${event.first_name} added to your bar!`))
            this.barList.forEach(barItem => {
                if(barItem.bar_tag === bar.bar_tag){
                    barItem.members.push(event);
                }
            });
        })
        .catch(() => reject(this.utilityService.rejectAsyncPromise(`Unable to add ${event.first_name} to your bar`)))
        }))
        
    }

  onCloseDialog() {
    this.closeEvent.emit(this.barTag);
  }
}
