import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';

@Component({
  selector: 'app-group-header',
  templateUrl: './group-header.component.html',
  styleUrls: ['./group-header.component.scss']
})
export class GroupHeaderComponent implements OnInit {
  group;
  group_id;
  constructor(private groupService: GroupService,
    public groupDataService: GroupDataService) { }

  ngOnInit() {

    this.group_id = this.groupDataService.groupId;

  }
}

