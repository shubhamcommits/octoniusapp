import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { CommentService } from 'src/shared/services/comment-service/comment.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-engagement-card',
  templateUrl: './engagement-card.component.html',
  styleUrls: ['./engagement-card.component.scss']
})
export class EngagementCardComponent implements OnChanges {

  @Input() period;
  @Input() group: string;
  @Input() filteringGroups;

  // Current Workspace Data
  workspaceData: any

  groups: any = [];
  posts: any = [];

  num_agoras = 0;
  num_highly_engaged = 0;
  num_topics = 0;
  num_comments = 0;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private groupsService: GroupsService,
    private groupService: GroupService,
    private postService: PostService,
    private commentService: CommentService,
    private injector: Injector
  ) { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {

    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.num_agoras = 0;
    this.num_highly_engaged = 0;
    this.num_topics = 0;
    this.num_comments = 0;

    if (this.group) {
      await this.getPosts();

      this.posts.forEach(post => {
        if (post) {
          this.num_topics++;

          this.commentsCount(post._id);
        }
      });
    } else {
      this.groups = await this.getGroups();

      const comparingDate = moment().local().subtract(this.period, 'days').toDate();

      for (let group of this.groups) {
        if (group.type === 'agora' && (moment(group.created_date).add(-1,'days')).isAfter(comparingDate)) {
          this.num_agoras++;
        }

        this.getTopicsCount(group._id || group);
      }
    }
  }

  async getGroups() {
    return new Promise((resolve, reject) => {
      if (this.filteringGroups && this.filteringGroups.length > 0) {
        resolve(this.filteringGroups);
      } else {
        this.groupsService.getWorkspaceGroups(this.workspaceData._id)
          .then((res) => {
            resolve(res['groups'])
          })
          .catch(() => {
            reject([])
          });
      }
    });
  }

  /**
   * This function returns the count of  pulse
   */
  async getTopicsCount(groupId) {
    return new Promise((resolve, reject) => {
      this.groupService.getPostsCount(groupId, this.period)
        .then((res) => {
          this.num_topics += res['numPosts'];
          resolve(res['numPosts'])
        })
        .catch(() => reject(0));
    })
  }

  async getPosts() {
    await this.postService.getGroupPosts(this.group, 'post', this.period)
    .then((res) => {
      this.posts = res['posts'];
    });
  }

  /**
   * This function returns the count of  comments by post
   */
  async commentsCount(postId) {
    return new Promise((resolve, reject) => {
      this.commentService.getCommentsCount(postId, this.period)
        .then((res) => {
          this.num_comments += res['numComments'];
          resolve(res['numComments'])
        })
        .catch(() => reject(0));
    })
  }

}
