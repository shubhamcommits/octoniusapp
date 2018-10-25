import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { PostService } from '../../../shared/services/post.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-overview-my-tasks',
  templateUrl: './overview-my-tasks.component.html',
  styleUrls: ['./overview-my-tasks.component.scss']
})
export class OverviewMyTasksComponent implements OnInit {

  user_data;
  lastPostId;
  isLoading$ = new BehaviorSubject(false);
  pendingTasks = new Array();
  completedTasks = new Array();

  constructor( private ngxService: NgxUiLoaderService, private userService: UserService, private postService: PostService) { 

    this.user_data = JSON.parse(localStorage.getItem('user')); 
    this.getTasks();
    this.getCompletedTasks();
  }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
    
  }

  getTasks() {
    this.userService.getUserTasks()
    .subscribe((res) => {
      this.pendingTasks = res['posts'];
      console.log('Tasks', res);
    },    
    (err) => {
      console.log('Error Fetching the Pending Tasks Posts', err)
    });
  }

  loadNextPosts(lastPostId)
  {

    this.isLoading$.next(true);

    this.userService.getRecentUserTasks(lastPostId)
      .subscribe((res) => {
       console.log('CompletedTasks', res);
        this.completedTasks = this.completedTasks.concat(res['posts']);
       this.isLoading$.next(false);

      }, (err) => {
        console.log('Error Fetching the Next Completed Tasks Posts', err)

      });
  }

  OnFetchNextPosts(){
    var lastPostId = this.completedTasks[this.completedTasks.length - 1]._id;
    this.loadNextPosts(lastPostId);
  }

  
  OnMarkTaskCompleted(post_id){
    const post = {
      'status': 'done'
    };
    this.postService.complete(post_id,post)
    .subscribe((res) => {
      console.log('Post Marked as Completed', res);
      this.getCompletedTasks();
      this.getTasks();

    }, (err) => {

      console.log('Error:', err);

    });

  }

  OnMarkTaskToDo(post_id){
    const post = {
      'status': 'to do'
    };
    this.postService.complete(post_id,post)
    .subscribe((res) => {
      console.log('Post Marked as to do', res);
      this.getCompletedTasks();
      this.getTasks();

    }, (err) => {

      console.log('Error:', err);

    });

  }

  OnMarkTaskInProgress(post_id){
    const post = {
      'status': 'in progress'
    };
    this.postService.complete(post_id,post)
    .subscribe((res) => {
      console.log('Post Marked as in Progress', res);
      this.getCompletedTasks();
      this.getTasks();

    }, (err) => {

      console.log('Error:', err);

    });

  }


  getCompletedTasks() {
    this.userService.getCompletedUserTasks()
    .subscribe((res) => {
      this.completedTasks = res['posts'];
      console.log('Completed Tasks', res);
    }, 
    (err) => {
      console.log('Error Fetching the Completed Tasks Posts', err)
    });

  }

}
