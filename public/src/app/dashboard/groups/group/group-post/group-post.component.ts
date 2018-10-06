import { Component, OnInit } from '@angular/core';
import { PostService } from '../../../../shared/services/post.service';

@Component({
  selector: 'app-group-post',
  templateUrl: './group-post.component.html',
  styleUrls: ['./group-post.component.scss']
})
export class GroupPostComponent implements OnInit {

  post;
  postId;

  constructor(private postService: PostService) { }

  ngOnInit() {
    console.log('Post ID', this.postId);
  }

  getPost(postId){
    this.postService.getPost(postId)
        .subscribe((res) => {
          this.post = res
          console.log('Post', this.post);

        });

  }

}
