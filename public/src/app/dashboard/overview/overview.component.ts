import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BehaviorSubject } from 'rxjs';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user.model';
import { AuthService } from '../../shared/services/auth.service';
import { GoogleCloudService } from '../../shared/services/google-cloud.service';
import { GroupsService } from '../../shared/services/groups.service';
import { PostService } from '../../shared/services/post.service';
import { UserService } from '../../shared/services/user.service';
//Google API Variables
declare var gapi: any;
declare var google: any;
//Google API Variables

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})

export class OverviewComponent implements OnInit {

  posts = [];
  recentPosts = [];
  comments = [];
  groups = [];

  event_count = 0;
  task_count = 0;
  normal_count = 0;

  user_data;
  user: User;

  ///#/dashboard/group/{{notifications._origin_post._group}}/post/{{notifications._origin_post._id}}

  today = new Date();

  socket = io(environment.BASE_URL);

  notifications_data;

  isLoading$ = new BehaviorSubject(false);

  group = {
    group_name: '',
  };


  constructor(private _userService: UserService, private _authService: AuthService, private _router: Router,  private ngxService: NgxUiLoaderService,
  private _postservice: PostService, private _groupservice: GroupsService,
  private googlCloudService: GoogleCloudService) {

    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.loadGoogleDrive();


  }

  loadGoogleDrive() {
    gapi.load('auth', { 'callback': console.log('Google Drive loaded') });
  }


  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    const user = {
      'userId': this.user_data.user_id
      }
      this.socket.on('notificationsFeed', (user) => {
        console.log('Get Notifications socket on', user);
        this.notifications_data = user;
      });
      this.socket.emit('getNotifications', this.user_data.user_id);

    // The next few lines are responsible for joining all groups
    // in the workspace associated with the current user
    const workspace: string = this.user_data.workspace.workspace_name;
    this._groupservice.getGroupsForUser(workspace).subscribe(
      // @ts-ignore
      ({ groups }) => {
        groups.map(group => {
          const room = {
            workspace,
            group: group.group_name
          };
          
          // Join all groups
          this.socket.emit('joinGroup', room);
        })
      },
      (err) => console.error(`Could not get groups! ${err}`)
    );

    this.liveUpdatesForPosts();

    this.getRecentPosts()
    .then(()=>{
      this.ngxService.stop();
    })
    .catch((err)=>{
      console.log('Error while getting recent posts', err);
    })
  }

  getRecentPosts() {
    return new Promise((resolve, reject)=>{
      this.isLoading$.next(true);

      this._postservice.useroverviewposts(this.user_data.user_id)
      .subscribe((res) => {
        // console.log('Group posts:', res);
        this.posts = res['posts'];
        this.comments = res['comments'];

        // Adding the readMore property to every comment.
        // This property is used when making the post collapsible.
        this.comments = this.comments.map(comment => {
          comment.readMore = true;
          return comment;
        });

        this.recentPosts = res['recentPosts'];

        if (this.comments.length > 0) {
          this.normal_count = 1;
        }

        for (let i = 0 ; i < this.posts.length; i ++) {
          if ( this.posts[i].type === 'task' && this.posts[i].task.status !== 'done' ) {
            this.task_count = 1;
          }
          if (this.posts[i].type === 'event') {
            this.event_count = 1;
          }
          if (this.posts[i].type === 'event' && this.posts[i].comments_count > 0) {
            this.normal_count = 1;
          }
          if (this.posts[i].type === 'task' && this.posts[i].comments_count > 0 && this.posts[i].task.status !== 'done') {
            this.normal_count = 1;
          }
        }
      // console.log('User Post:', this.posts);
      // console.log('Event Response:', this.event_count);
      // console.log('Task Response:', this.task_count);
      // console.log('Normal Response:', this.normal_count);
       if ( this.posts.length === 0 ) {
        this.isLoading$.next(true);
       } else {
        this.isLoading$.next(false);
       }
       resolve();

      }, (err) => {
          reject(err);
      });
    })


  }


  markPostAsRead(postId) {
    this._postservice.markPostAsRead(postId)
      .subscribe(
        () => console.log('Post marked as read!'),
        (err) => console.error(`Cannot mark post as read! ${err}`)
      );
  }

  markCommentAsRead(commentId) {
    this._postservice.markCommentAsRead(commentId)
      .subscribe(
        () => console.log('Comment marked as read!'),
        (err) => console.error(`Cannot mark comment as read! ${err}`)
      );
  }

  /**
   * This method is responsible for updating the Upcoming Events,
   * Upcoming Tasks, and Recent Posts sections of the overview
   * without having to refresh the page.
   */
  liveUpdatesForPosts() {
    this.socket.on('newPostOnGroup', data => {
      this._postservice.getPost(data.postId).subscribe(
        // @ts-ignore
        ({ post }) => {
          this.recentPosts.unshift(post);

          if (post.type === 'event') {
            const { event } = post;
            // Check if the event is assigned to the current user
            const user = event._assigned_to.filter(user => {
              return this.user_data.user_id.toString() === user._id.toString();
            });

            // The current user was assigned the event
            if (user.length === 1) {
              const today = new Date();
              const eventDueDate = new Date(event.due_to.toString());

              // Check if the event is due today
              if (today.toDateString() === eventDueDate.toDateString()) {
                if (this.event_count !== 1) this.event_count = 1;
                this.posts.unshift(post);
              }
            }
          } else if (post.type === 'task') {
            const { task } = post;
            // Check if the task is assigned to the current user
            if (this.user_data.user_id.toString() === task._assigned_to._id.toString()) {
              const today = new Date();
              const taskDueDate = new Date(task.due_to.toString());

              // Check if the task has a due date >= today
              if (taskDueDate.toDateString() >= today.toDateString()) {
                if (this.task_count !== 1) this.task_count = 1;
                this.posts.unshift(post);
              }
            }
          }
        },
        err => console.error(`New post could not be fetched! ${err}`)
      );
    });
  }

}
