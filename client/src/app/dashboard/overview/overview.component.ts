import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {BehaviorSubject} from 'rxjs';
import io from 'socket.io-client';
import {environment} from '../../../environments/environment';
import {User} from '../../shared/models/user.model';
import {AuthService} from '../../shared/services/auth.service';
import {GoogleCloudService} from '../../shared/services/google-cloud.service';
import {GroupsService} from '../../shared/services/groups.service';
import {PostService} from '../../shared/services/post.service';
import {UserService} from '../../shared/services/user.service';
import {post} from 'selenium-webdriver/http';
import {faCalendar} from '@fortawesome/free-solid-svg-icons';

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
  /***
   * Jessie Jia Edit Starts
   */
  todayPosts = [];
  todayFirstTwoEvents = [];
  thisWeekTasks = [];
  overdueTasks = [];
  today_event_count = 0;
  today_task_count = 0;
  to_do_task_count = 0;
  in_progress_task_count = 0;
  done_task_count = 0;
  likedPostsCount = 0;
  followedPostsCount = 0;


  /***
   * Jessie Jia Edit Ends
   */

  comments = [];
  groups = [];

  event_count = 0;
  task_count = 0;
  normal_count = 0;

  user_data;
  user: User;

  today = new Date();

  socket = io(environment.BASE_URL, {
    path: '/socket.io',
    transports: ['websocket'],
    secure: true,
  });

  notifications_data;

  isLoading$ = new BehaviorSubject(false);

  group = {
    group_name: '',
  };

  BASE_URL = environment.BASE_URL;

  constructor(private _userService: UserService, private _authService: AuthService, private _router: Router, private ngxService: NgxUiLoaderService,
              private _postservice: PostService, private _groupservice: GroupsService,
              private googlCloudService: GoogleCloudService, private userService: UserService) {

    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.loadGoogleDrive();


  }

  loadGoogleDrive() {
    gapi.load('auth', {'callback': console.log('Google Drive loaded')});
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
      ({groups}) => {
        groups.map(group => {
          const room = {
            workspace,
            group: group.group_name
          };

          // Join all groups
          this.socket.emit('joinGroup', room);
        });
      },
      (err) => console.error(`Could not get groups! ${err}`)
    );

    this.liveUpdatesAdd();
    this.liveUpdatesDelete();
    this.liveUpdatesEdit();

    this.getRecentPosts()
      .then(() => {
        this.ngxService.stop();
      })
      .catch((err) => {
        console.log('Error while getting recent posts', err);
      });

    this.getTodayPosts()
      .then(() => {
        this.ngxService.stop();
      })
      .catch((err) => {
        console.log('Error while getting today posts', err);
      });

    this.getThisWeekTasks()
      .then(() => {
        this.ngxService.stop();
      })
      .catch((err) => {
        console.log('Error while getting this week tasks', err);
      });

    this.getOverdueTasks()
      .then(() => {
        this.ngxService.stop();
      })
      .catch((err) => {
        console.log('Error while getting overdue tasks', err);
      });

    this.getLikedPostsCount()
      .then(() => {
        this.ngxService.stop();
      })
      .catch((err) => {
        console.log('Error while getting liked posts', err);
      });

    this.getFollowedPostsCount()
      .then(() => {
        this.ngxService.stop();
      })
      .catch((err) => {
        console.log('Error while getting followed posts', err);
      });

  }



  getRecentPosts() {
    return new Promise((resolve, reject) => {
      this.isLoading$.next(true);

      this._postservice.useroverviewposts(this.user_data.user_id)
        .subscribe((res) => {
          this.posts = res['posts'];
          this.comments = res['comments'];
          // Adding the readMore property to every comment.
          // This property is used when making the post collapsible.
          this.comments = this.comments.map(comment => {
            comment.readMore = true;
            return comment;
          });
          //concat recent posts with followed posts
          this.recentPosts = [...res['recentPosts'], ...res["followedPost"]];

          if (this.comments.length > 0) {
            this.normal_count = 1;
          }

          for (let i = 0; i < this.posts.length; i++) {
            if (this.posts[i].type === 'task' && this.posts[i].task.status !== 'done') {
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
          if (this.posts.length === 0) {
            this.isLoading$.next(true);
          } else {
            this.isLoading$.next(false);
          }
          resolve();

        }, (err) => {
          reject(err);
        });
    });
  }

  /***
   * Jessie Jia Edit Starts
   * @param postId
   */

  getTodayPosts() {
    return new Promise((resolve, reject) => {
      this.isLoading$.next(true);

      this._postservice.userOverviewPostsToday(this.user_data.user_id)
        .subscribe((res) => {
          this.todayPosts = res['posts'];
          this.getTodayTasksAndEvents();

          if (this.todayPosts.length === 0) {
            this.isLoading$.next(true);
          } else {
            this.isLoading$.next(false);
          }
          resolve();

        }, (err) => {
          reject(err);
        });
    });
  }


  getThisWeekTasks() {
    return new Promise((resolve, reject) => {
      this.userService.getUserThisWeekTasks()
        .subscribe((res) => {
          this.thisWeekTasks = res['tasks'];
          this.countTasksForToday();
        }, (err) => {
          reject([]);
        });
    });
  }


  getOverdueTasks() {
    return new Promise((resolve, reject) => {
      this.userService.getUserOverdueTasks()
        .subscribe((res) => {
          this.overdueTasks = res['tasks'];
        }, (err) => {
          reject([]);
        });
    });

  }

  private getLikedPostsCount() {
    return new Promise((resolve, reject) => {
      this.userService.getLikedPostsCount()
        .subscribe((res) => {
          this.likedPostsCount = res['likedPostsCount'];
        }, (err) => {
          reject([]);
        });
    });
  }

  private getFollowedPostsCount() {
    return new Promise((resolve, reject) => {
      this.userService.getFollowedPostsCount()
        .subscribe((res) => {
          this.followedPostsCount = res['followedPostsCount'];
        }, (err) => {
          reject([]);
        });
    });
  }

  private getTodayTasksAndEvents() {
    for (let i = 0; i < this.todayPosts.length; i++) {
      if (this.todayPosts[i].type === 'task') {
        this.computeTasksCounts(this.todayPosts[i].task, true);
      }
      if (this.todayPosts[i].type === 'event') {
        this.computeEventsData(this.todayPosts[i]);

      }
    }
  }

  private countTasksForToday() {
    for (let i = 0; i < this.thisWeekTasks.length; i++) {
      this.computeTasksCounts(this.thisWeekTasks[i].task, false);
    }
  }

  private computeTasksCounts(task: any, countDoneTasks: boolean) {
    if (task.status === 'to do') {
      this.today_task_count++;
      this.to_do_task_count++;
    }

    if (task.status === 'in progress') {
      this.today_task_count++;
      this.in_progress_task_count++;
    }

    if (countDoneTasks && (task.status.trim() === 'completed' || task.status.trim() === 'done')) {
      this.today_task_count++;
      this.done_task_count++;
    }

  }

  private computeEventsData(post: any) {
    this.today_event_count++;
    if (this.today_event_count <= 2) {
      this.todayFirstTwoEvents.push(post);
    }
  }

  /***
   * Jessie Jia Edit Ends
   * @param postId
   */


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
   * This method is responsible for updating the entire overview
   * without having to refresh the page once a new post has been added.
   */
  liveUpdatesAdd() {
    const currentUserId: string = this.user_data.user_id.toString();
    this.socket.on('postAddedInGroup', data => {
      if (data.type === 'post') {
        this._postservice.getPost(data.postId).subscribe(
          // @ts-ignore
          ({post}) => {
            this.recentPosts.unshift(post);

            if (post.type === 'event') {
              const {event} = post;
              // Check if the event is assigned to the current user
              const user = event._assigned_to.filter(user => {
                return currentUserId === user._id.toString();
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
              const {task} = post;
              // Check if the task is assigned to the current user
              if (currentUserId === task._assigned_to._id.toString()) {
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
      } else if (data.type === 'comment') {
        this._postservice.getComment(data.commentId).subscribe(
          // @ts-ignore
          ({comment}) => {
            // Ensure the comment was made on the current user's post
            if (currentUserId === comment._post._posted_by) {
              // Ensure the comment was not made by the current user
              if (currentUserId !== comment._commented_by._id) {
                comment.readMore = true;
                this.comments.unshift(comment);
              }
            } else if (comment._post._followers.length > 0) {
              for (let i = 0; i < comment._post._followers.length; i++) {
                if (currentUserId === comment._post._followers[i]) {
                  comment.readMore = true;
                  this.comments.unshift(comment);
                }
              }
            }
          },
          err => console.error(`New comment could not be fetched! ${err}`)
        );
      }
    });
  }

  /**
   * This method is responsible for updating the entire overview
   * without having to refresh the page once a post has been deleted.
   */
  liveUpdatesDelete() {
    this.socket.on('postDeletedInGroup', data => {
      if (data.type === 'post') {
        // Update the recent posts array by removing the deleted post
        this.recentPosts = this.recentPosts.filter(post => {
          return post._id.toString() !== data.postId.toString();
        });

        // Update the posts array by removing the deleted post
        this.posts = this.posts.filter(post => {
          return post._id.toString() !== data.postId.toString();
        });

        // Check if there are any event or task type posts remaining
        // This avoids the glitch of showing the title in the UI despite
        // there being no such post in the array
        const taskType = this.posts.filter(post => {
          return post.type === 'task';
        });

        if (taskType.length === 0) this.task_count = 0;

        // Doing the same as above for event type posts
        const eventType = this.posts.filter(post => {
          return post.type === 'event';
        });

        if (eventType.length === 0) this.event_count = 0;
      } else if (data.type === 'comment') {
        // Remove the deleted comment from the comments array
        this.comments = this.comments.filter(comment => {
          return comment._id.toString() !== data.commentId.toString();
        });
      }
    });
  }

  liveUpdatesEdit() {
    this.socket.on('postEditedInGroup', data => {
      if (data.type === 'post') {
        this._postservice.getPost(data.postId).subscribe(
          // @ts-ignore
          ({post}) => {
            // Indices of the post to update
            const postsIndex = this.posts.findIndex(_post => {
              return _post._id.toString() === post._id.toString();
            });

            const recentPostsIndex = this.recentPosts.findIndex(_post => {
              return _post._id.toString() === post._id.toString();
            });

            // Check if posts exist and update
            if (postsIndex >= 0) {
              this.posts[postsIndex] = post;
            }

            if (recentPostsIndex >= 0) {
              this.recentPosts[recentPostsIndex] = post;
            }
          },
          err => console.error(`Updated post could not be fetched! ${err}`)
        );
      } else if (data.type === 'comment') {
        this._postservice.getComment(data.commentId).subscribe(
          // @ts-ignore
          ({comment}) => {

            // Index of the comment to update
            const index = this.comments.findIndex(_comment => {
              return _comment._id.toString() === comment._id.toString();
            });

            // Comment exists in array
            if (index >= 0) {
              // Update the comment
              this.comments[index] = comment;
            }
          },
          err => console.error(`Updated comment could not be fetched! ${err}`)
        );
      }
    });
  }
}
