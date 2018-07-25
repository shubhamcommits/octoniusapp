import { Component, OnInit } from '@angular/core';
import { Group } from '../../../../shared/models/group.model';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { GroupService } from '../../../../shared/services/group.service';
@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.component.html',
  styleUrls: ['./group-members.component.scss']
})
export class GroupMembersComponent implements OnInit {
  group_id;
  group_members;
  group_admins;


  constructor(private groupDataService: GroupDataService, private groupService: GroupService) { }

  ngOnInit() {

    this.group_id = this.groupDataService.groupId;

    this.loadGroup();
  }


  loadGroup() {

    this.groupService.getGroup(this.group_id)
      .subscribe((res) => {
        this.group_members = res['group']._members;
        console.log('test' + this.group_members._members[0]);
        this.group_admins = res['group']._admins;

      }, (err) => {

      });
  }

}

