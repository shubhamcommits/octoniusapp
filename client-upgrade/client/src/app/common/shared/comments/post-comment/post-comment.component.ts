import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'post-comment',
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.scss']
})
export class PostCommentComponent implements OnInit {

  constructor() { }

  // Baseurl
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // GroupId Input Variable
  @Input('groupId') groupId: any

  // Index of the comment inside the comment variable
  @Input('index') index: any

  // User Data Vaiable
  @Input('userData') userData: any;

  // Post Comment Variable
  @Input('comment') comment = {
    _id: '',
    likes_count: 0,
    _liked_by: [],
    content: '',
    _commented_by: {
      profile_pic: '',
      first_name: '',
      last_name: ''
    },
    created_date: new Date(Date.now())
  }

  // Display Comment editor variable
  displayCommentEditor: boolean = false;

  ngOnInit() {
    console.log(this.comment)

  }

}

