import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/user.model';
import { NgxUiLoaderService } from 'ngx-ui-loader'; 
import { PostService } from '../../shared/services/post.service';
import { GroupsService } from '../../shared/services/groups.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  posts = new Array();
  groups = new Array();

  event_count = 0;
  task_count = 0;
  normal_count = 0;

  user_data;
  user: User;

  today = new Date();

  isLoading$ = new BehaviorSubject(false);

  group = {
    group_name: '',
  };

  constructor(private _userService: UserService, private _authService: AuthService, private _router: Router,  private ngxService: NgxUiLoaderService,
  private _postservice: PostService, private _groupservice: GroupsService) { }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.getRecentPosts();

  }

  getRecentPosts(){

    this.isLoading$.next(true);
    this._postservice.useroverviewposts(this.user_data.user_id)
    .subscribe((res) => {
      // console.log('Group posts:', res);
      this.posts = res['posts'];
      for(var i = 0 ; i < this.posts.length; i ++){
        if(this.posts[i].type=='task' && this.posts[i].completed == false){
          this.task_count=1;
        }
        if(this.posts[i].type=='event' && this.posts[i].completed == false){
          this.event_count=1;
        }
        if(this.posts[i].type=='normal'){
          this.normal_count=1;
        }
      }
     console.log('User Post:', this.posts);
     console.log('Event Response:', this.event_count);
     console.log('Task Response:', this.task_count);
     console.log('Normal Response:', this.normal_count);
     if(this.posts.length == 0)
     {
      this.isLoading$.next(true);
     }
     

     else{
      this.isLoading$.next(false);
     }
  


    }, (err) => {

    });

  }



}
