import { Component, OnInit, Injector, Input, EventEmitter, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';

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
  numLikes;

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
    this.filterPostsEmitter.emit({ tags: this.filterTags, users: this.usersIds, numLikes: this.numLikes });
  }

  async assigneeRemovedEmiter(userId: string) {
    this.filterUsers.splice(this.filterUsers.findIndex(user => user._id == userId), 1);
    this.usersIds.splice(this.usersIds.findIndex(user => user == userId), 1);

    this.filterPostsEmitter.emit({ tags: this.filterTags, users: this.usersIds, numLikes: this.numLikes });
  }

  async onTagSelctionEmitter(tags: any) {
    this.filterTags = tags;
    this.post.tags = this.filterTags;
    this.filterPostsEmitter.emit({ tags: this.filterTags, users: this.usersIds, numLikes: this.numLikes });
  }

  async onLikesEmitter() {
    this.filterPostsEmitter.emit({ tags: this.filterTags, users: this.usersIds, numLikes: this.numLikes });
  }
}
