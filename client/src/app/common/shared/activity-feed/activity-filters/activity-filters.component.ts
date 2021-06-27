import { Component, OnInit, Injector, Input, EventEmitter, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-activity-filters',
  templateUrl: './activity-filters.component.html',
  styleUrls: ['./activity-filters.component.scss']
})
export class ActivityFiltersComponent implements OnInit {

  // GroupData variable
  @Input() groupData: any;

  @Output() filterPostsEmitter: EventEmitter<Object> = new EventEmitter<Object>();

  groupMembers:any = [];

  userData: any;
  post: any = {
    tags: []
  };

  filterUsers = [];
  usersIds = [];
  filterTags = [];

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(public injector: Injector) { }

  async ngOnInit() {
    if (!this.groupData) {
      this.groupData = await this.publicFunctions.getCurrentGroup();
    }
    this.groupMembers = await this.publicFunctions.getCurrentGroupMembers();
    this.userData = await this.publicFunctions.getCurrentUser();
  }

  async onUserSelctionEmitter(user: any) {
    this.filterUsers.push(user);
    this.usersIds.push(user._id);
    this.filterPostsEmitter.emit({ tags: this.filterTags, users: this.usersIds });
  }

  async assigneeRemovedEmiter(userId: string) {
    this.filterUsers.splice(this.filterUsers.findIndex(user => user._id == userId), 1);
    this.usersIds.splice(this.usersIds.findIndex(user => user == userId), 1);

    this.filterPostsEmitter.emit({ tags: this.filterTags, users: this.usersIds });
  }

  async onTagSelctionEmitter(tags: any){
    this.filterTags = tags;
    this.post.tags = this.filterTags;
    this.filterPostsEmitter.emit({ tags: this.filterTags, users: this.usersIds });
  }
}
