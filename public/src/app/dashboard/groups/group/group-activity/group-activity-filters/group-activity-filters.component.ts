import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GroupService} from "../../../../../shared/services/group.service";

@Component({
  selector: 'group-activity-filters',
  templateUrl: './group-activity-filters.component.html',
  styleUrls: ['./group-activity-filters.component.scss']
})
export class GroupActivityFiltersComponent implements OnInit {

  @Input('posts') posts = [];
  @Input('group') group;

  @Output('sendFilteredPosts') sendFilteredPosts = new EventEmitter();
  @Output('loadGroupPosts') loadGroupPosts = new EventEmitter();

  // filters
  filters = {
    normal: false,
    event: false,
    task: false,
    user: false,
    tag: false,
    user_value: '',
    tag_value: ''
  };

  constructor(private groupService: GroupService) { }

  ngOnInit() {
  }

  filterPosts() {
    const filters = this.filters;
    this.groupService.getFilteredPosts(this.group._id, filters)
      .subscribe((res) => {
        this.sendFilteredPosts.emit(res['posts']);
      });
  }

  getNextFilteredPosts() {
    const filters = this.filters;
    const alreadyLoaded = this.posts.length;

    this.groupService.getNextFilteredPosts(this.group._id, filters, alreadyLoaded)
      .subscribe((res) => {
        this.sendFilteredPosts.emit([...this.posts, ...res['posts']]);
      });
  }

  toggleFilter(type) {
    this.filters[type] = !this.filters[type];

    if (this.filters[type]) {
      if (!(type === 'user' && !this.filters.user_value) && !(type === 'tag' && !this.filters.tag_value)) {
        console.log("here2")
        this.filterPosts();
      } 
    } else {
      //  check if other filters are still checked
      if (this.filters.normal || this.filters.event || this.filters.task || (this.filters.user && !!this.filters.user_value) || (this.filters.tag && !!this.filters.tag_value)) {
        console.log("here1")
        this.filterPosts();
      } else {
        this.loadGroupPosts.emit();
      }
    }
  }

}
