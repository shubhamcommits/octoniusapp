import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../../shared/services/group.service';
import { ActivatedRoute } from '@angular/router';
import { GroupDataService } from '../../../shared/services/group-data.service';
import { NgxUiLoaderService } from 'ngx-ui-loader'; 

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  group_id;
  group;

  constructor(private groupSrevice: GroupService, private _activatedRoute: ActivatedRoute, private groupDataService: GroupDataService,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit() {
    this.group_id = this._activatedRoute.snapshot.paramMap.get('id');
    this.groupDataService.groupId = this.group_id;
    // console.log('group_id in group parent: ', this.group_id);


    this.loadGroup();
  }

  loadGroup() {
    this.groupSrevice.getGroup(this.group_id)
      .subscribe((res) => {
        // console.log('response in group component:', res);
        this.groupDataService.group = res['group'];

      }, (err) => {

      });

  }



}
