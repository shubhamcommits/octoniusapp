import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { PostService } from '../../../shared/services/post.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BehaviorSubject } from 'rxjs';
import { GroupDataService } from '../../../shared/services/group-data.service';
import { GroupService } from '../../../shared/services/group.service';

@Component({
  selector: 'app-overview-my-tasks',
  templateUrl: './overview-my-tasks.component.html',
  styleUrls: ['./overview-my-tasks.component.scss']
})
export class OverviewMyTasksComponent implements OnInit {

  user_data;
  lastPostId;
  group_members;
  group_admins;
  groupId;
  isLoading$ = new BehaviorSubject(false);
  pendingTasks = new Array();
  completedTasks = new Array();
  loadCount = 1;

  pendingToDoTaskCount = 0;
  pendingInProgressTaskCount = 0;

  constructor(private groupDataService: GroupDataService, private groupService: GroupService, private ngxService: NgxUiLoaderService, private userService: UserService, private postService: PostService) {

    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.groupId = this.groupDataService.groupId;
    this.loadGroup();
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

  changeTaskAssignee(postId, AssigneeId){
    const assigneeId ={
      'assigneeId':AssigneeId
    }
    this.groupService.changeTaskAssignee(postId, assigneeId)
    .subscribe((res) => {
      this.getTasks();
      this.getCompletedTasks();
    }, (err) => {
      console.log('Error changing the Task Assignee', err);
    });
  }

  loadGroup() {

    this.groupService.getGroup(this.groupId)
      .subscribe((res) => {
        this.group_members = res['group']._members;
        this.group_admins = res['group']._admins;

      }, (err) => {
        console.log('Error fetching the members and admins', err);

      });
  }

  getTasks() {
    this.pendingToDoTaskCount = 0;
    this.pendingInProgressTaskCount = 0;
    this.isLoading$.next(true);
    this.userService.getUserTasks()
    .subscribe((res) => {
      this.pendingTasks = res['posts'];
      this.isLoading$.next(false);
      const pendingToDoTasks = this.pendingTasks.filter(pendingTask => pendingTask.task.status == 'to do');
      const pendingInProgressTasks = this.pendingTasks.filter(pendingTask => pendingTask.task.status == 'in progress');
      for(var task of pendingToDoTasks)
      {
       this.pendingToDoTaskCount = 1;
      }
      for(var task of pendingInProgressTasks)
      {
         this.pendingInProgressTaskCount = 1;
      } 	
   //   for(var i = 0; i < this.pendingTasks.length; i++){
   //     if(this.pendingTasks[i]['task']['status'] == 'to do'){
   //       this.pendingToDoTaskCount = 1;
   //     }
   //    if(this.pendingTasks[i]['task']['status'] == 'in progress'){
   //       this.pendingInProgressTaskCount = 1;
   //     }
   //   }
    },
    (err) => {
      console.log('Error Fetching the Pending Tasks Posts', err);
      this.isLoading$.next(false);
    });
  }

  loadNextPosts(lastPostId)
  {

    this.isLoading$.next(true);

    this.userService.getRecentUserTasks(lastPostId)
      .subscribe((res) => {

        this.completedTasks = this.completedTasks.concat(res['posts']);
       this.isLoading$.next(false);
       if(res['posts'].length == 0){
         this.loadCount = 0;
       }

       else{
         this.loadCount = 1;
       }

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
      this.getCompletedTasks();
      //this.getTasks();
      
      this.pendingToDoTaskCount = 1;
      this.isLoading$.next(true);
      for(var i = 0;i < this.pendingTasks.length ; i++)
      {
         if(this.pendingTasks[i]['_id'] == post_id)
           {
             this.pendingTasks[i]['task']['status'] = 'to do';  
             console.log("found");
             break;
            } 

      }
      this.isLoading$.next(false);  
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
      this.getCompletedTasks();
      //this.getTasks();
      this.pendingInProgressTaskCount = 1;
      this.isLoading$.next(true);
      for(var i = 0;i < this.pendingTasks.length ; i++)
      {
         if(this.pendingTasks[i]['_id'] == post_id)
           {
             this.pendingTasks[i]['task']['status'] = 'in progress';
             console.log("found1");
             break;
            }

      }
      this.isLoading$.next(false);  
    }, (err) => {

      console.log('Error:', err);

    });

  }


  getCompletedTasks() {
    this.isLoading$.next(true);
    this.userService.getCompletedUserTasks()
    .subscribe((res) => {
      this.completedTasks = res['posts'];

      this.isLoading$.next(false);
      if(res['posts'].length == 0){
        this.loadCount = 0;
      }

      else{
        this.loadCount = 1;
      }

    },
    (err) => {
      console.log('Error Fetching the Completed Tasks Posts', err);
      this.isLoading$.next(false);
    });

  }

}
