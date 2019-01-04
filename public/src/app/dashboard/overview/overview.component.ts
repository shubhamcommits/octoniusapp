import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/user.model';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PostService } from '../../shared/services/post.service';
import { GroupsService } from '../../shared/services/groups.service';
import { BehaviorSubject } from 'rxjs';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})

export class OverviewComponent implements OnInit {

  posts = [];
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
  private _postservice: PostService, private _groupservice: GroupsService) {

    this.user_data = JSON.parse(localStorage.getItem('user'));


  }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);

    this.getRecentPosts();
    const user = {
      'userId': this.user_data.user_id
      }
      this.socket.on('notificationsFeed', (user) => {
        console.log('Get Notifications socket on', user);
        this.notifications_data = user;
      });
      this.socket.emit('getNotifications', this.user_data.user_id);
  }

  getRecentPosts() {
    this.isLoading$.next(true);

    this._postservice.useroverviewposts(this.user_data.user_id)
    .subscribe((res) => {
      // console.log('Group posts:', res);
      this.posts = res['posts'];
      this.comments = res['comments'];
      console.log('comments', this.comments);
      console.log('posts', this.posts);

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

    }, (err) => {

    });

  }



}
