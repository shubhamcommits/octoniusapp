import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../shared/services/user.service';
import { PostService } from '../../../../shared/services/post.service';
import { GroupService } from '../../../../shared/services/group.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { GroupDataService } from '../../../../shared/services/group-data.service';


@Component({
  selector: 'app-group-tasks',
  templateUrl: './group-tasks.component.html',
  styleUrls: ['./group-tasks.component.scss']
})
export class GroupTasksComponent implements OnInit {

  user_data;
  lastPostId;
  group_members;
  group_admins;
  groupId;
  isLoading$ = new BehaviorSubject(false);

  constructor(private groupDataService: GroupDataService, private ngxService: NgxUiLoaderService, private _activatedRoute: ActivatedRoute, private userService: UserService,private groupService: GroupService, private postService: PostService) {
    this.user_data = JSON.parse(localStorage.getItem('user')); 



  }


  pendingTasks = new Array();
  completedTasks = new Array();


  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
    this.groupId = this.groupDataService.groupId;
    //console.log('Data', this.groupDataService)
   // console.log('Id', this.groupId);
    this.getTasks();
    this.getCompletedTasks();
    this.loadGroup();


  }

  loadGroup() {

    this.groupService.getGroup(this.groupId)
      .subscribe((res) => {
        this.group_members = res['group']._members;
      // console.log(this.group_members);
        this.group_admins = res['group']._admins;
      //  console.log(this.group_admins);

      }, (err) => {

      });
  }

  getTasks() {
    this.groupService.getGroupTasks(this.groupId)
    .subscribe((res) => {
      this.pendingTasks = res['posts'];
      console.log('Tasks', res);
    },    
    (err) => {
      console.log('Error Fetching the Pending Tasks Posts', err)
    });
  }

  changeTaskAssignee(postId, AssigneeId){
    const assigneeId ={
      'assigneeId':AssigneeId
    }
    this.groupService.changeTaskAssignee(postId, assigneeId)
    .subscribe((res) => {
      console.log('Post ID', postId);
      console.log('Assignee ID', assigneeId);
      console.log('Task Assignee', res);  
      this.getTasks();
      this.getCompletedTasks();  
    }, (err) => {
      console.log('Error changing the Task Assignee', err);
    });
  }

  loadNextPosts(lastPostId)
  {

    this.isLoading$.next(true);

    this.groupService.getRecentGroupTasks(lastPostId, this.groupId)
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
    this.groupService.getCompletedGroupTasks(this.groupId)
    .subscribe((res) => {
      this.completedTasks = res['posts'];
      console.log('Completed Tasks', res);
    }, 
    (err) => {
      console.log('Error Fetching the Completed Tasks Posts', err)
    });

  }


}
