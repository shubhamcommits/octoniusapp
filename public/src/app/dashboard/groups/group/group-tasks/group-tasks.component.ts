import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../shared/services/user.service';
import { PostService } from '../../../../shared/services/post.service';
import { DragulaService } from 'ng2-dragula';


@Component({
  selector: 'app-group-tasks',
  templateUrl: './group-tasks.component.html',
  styleUrls: ['./group-tasks.component.scss']
})
export class GroupTasksComponent implements OnInit {

  user_data;

  constructor(private userService: UserService, private dragulaService: DragulaService, private postService: PostService) {
    this.user_data = JSON.parse(localStorage.getItem('user')); 

  }

  droppedData: string;

  pendingTasks = new Array();
  completedTasks = new Array();


  ngOnInit() {
    this.dragulaService.createGroup("VAMPIRES", {
      removeOnSpill: true
    });

    this.dragulaService.dropModel("VAMPIRES").subscribe(args => {
      
      const post = {
        'post_id': args['item']['_id'],
        'user_id': this.user_data.user_id
      };
      this.postService.complete(post)
      .subscribe((res) => {
        console.log('Task Marked Completed', res);
      }, (err) => {
        console.log('Error in Completing a task', err);
      });
      console.log(args);

    });
    this.getTasks();
    this.getCompletedTasks();
  }

  ngOnDestroy(){
    this.dragulaService.destroy("VAMPIRES");
  }

 
  dragEnd(event) {
    console.log('Element was dragged', event);
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
