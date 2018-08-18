import { Component, OnInit } from '@angular/core';
import { Group } from '../../../../shared/models/group.model';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { GroupService } from '../../../../shared/services/group.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.component.html',
  styleUrls: ['./group-members.component.scss']
})
export class GroupMembersComponent implements OnInit {
  group_id;
  group_members;
  group_admins;


  constructor(private groupDataService: GroupDataService, private groupService: GroupService, private ngxService: NgxUiLoaderService) { }

  ngOnInit() {

    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);

    this.group_id = this.groupDataService.groupId;

    this.loadGroup();
  }


  loadGroup() {

    this.groupService.getGroup(this.group_id)
      .subscribe((res) => {
        this.group_members = res['group']._members;
        console.log(this.group_members);
        this.group_admins = res['group']._admins;

      }, (err) => {

      });
  }

  removeUserfromGroup(user_id){
    const data = {
      'user_id':user_id,
      'group_id':this.groupDataService.groupId
  
    };
    this.groupService.removeUserFromGroup(data)
    .subscribe((res) =>{
      console.log('Group Member is Removed!');
    });
  }

}

