import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/user.model';
import { NgxUiLoaderService } from 'ngx-ui-loader'; 
import { PostService } from '../../shared/services/post.service';
import { GroupsService } from '../../shared/services/groups.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  posts = new Array();
  groups = new Array();

  user_data;
  user: User;

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
    this._postservice.useroverviewposts(this.user_data.user_id)
    .subscribe((res) => {
      // console.log('Group posts:', res);
      this.posts = res['posts'];
     console.log('User Post:', this.posts);
     for(var i = 0; i < this.posts.length; i++){
       this.groups[i]=this.posts[i]._group;
     }
     console.log('User Group:', this.groups);
  


    }, (err) => {

    });

  }



}
