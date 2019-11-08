import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { PostService } from '../../../shared/services/post.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-overview-my-tasks',
  templateUrl: './overview-my-tasks.component.html',
  styleUrls: ['./overview-my-tasks.component.scss']
})
export class OverviewMyTasksComponent implements OnInit {

  posts = [];
  recentPosts: any = [];

  constructor(private ngxService: NgxUiLoaderService, private _postservice: PostService, private userService: UserService) {

  }

  async ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
    this.recentPosts = await this.getRecentPosts();
    this.recentPosts = this.recentPosts.concat(await this.getCompletedPosts());

  }

  getRecentPosts() {
    return new Promise((resolve, reject)=>{
      this.userService.getUserTasks()
      .subscribe((res) => {
        //console.log('Group posts:', res);
       resolve(res['posts']);
      }, (err) => {
          reject([]);
      });
    });
  }

  getCompletedPosts() {
    return new Promise((resolve, reject)=>{
      this.userService.getCompletedUserTasks()
      .subscribe((res) => {
        //console.log('Group posts:', res);
       resolve(res['posts']);
      }, (err) => {
          reject([]);
      });
    });
  }

}
