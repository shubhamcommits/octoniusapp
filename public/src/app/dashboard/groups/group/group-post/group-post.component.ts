import { Component, OnInit } from '@angular/core';
import { PostService } from '../../../../shared/services/post.service';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { InputValidators } from '../../../../common/validators/input.validator';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-group-post',
  templateUrl: './group-post.component.html',
  styleUrls: ['./group-post.component.scss']
})
export class GroupPostComponent implements OnInit {

  user_data;

  post;
  postId;

  showComments = {
    id: '',
    normal: false,
    event: false,
    task: false
  };
  comment = {
    content: '',
    _commented_by: '',
    post_id: ''
  };
  commentForm;

  content_mentions = [];

  constructor(private ngxService: NgxUiLoaderService, private postService: PostService, private _activatedRoute: ActivatedRoute) {
    this.postId = this._activatedRoute.snapshot.paramMap.get('postId');
   
    this.user_data = JSON.parse(localStorage.getItem('user'));
   }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
    this.getPost(this.postId);
    this.inilizeCommentForm();

   // console.log('Post ID', this.postId);
  }

  getPost(postId){
    this.postService.getPost(postId)
        .subscribe((res) => {
          this.post = res['post'];
          console.log('Post', this.post);

        });

  }

  inilizeCommentForm() {
    this.commentForm = new FormGroup({
      'commentContent': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
    });
  }

  onAddNewComment(post_id) {
    // console.log('post._id: ', post_id);

    this.comment.post_id = post_id;
    this.comment._commented_by = this.user_data.user_id;

    this.postService.addNewComment(this.comment)
      .subscribe((res) => {
        this.commentForm.reset();
        this.getPost(post_id);

      }, (err) => {
        

        if (err.status) {
         
        } else {
        
        }

      });


  }

  likepost(){

    if(this.post._liked_by.length == 0) {
      const post = {
        'post_id': this.postId,
        'user_id': this.user_data.user_id
      };
  
      this.postService.like(post)
      .subscribe((res) => {
     //   console.log('Post Liked!');
        this.getPost(this.postId);
  
      }, (err) => {
  
        
  
        if (err.status) {
          
        } else {
        
        }
  
      });

    }

    else {
      if(this.post._liked_by.includes(this.user_data.user_id) ==  true){
        this.unlikepost();
      }
  
      else
      {
        const post = {
          'post_id': this.postId,
          'user_id': this.user_data.user_id
        };
    
        this.postService.like(post)
        .subscribe((res) => {
       //   console.log('Post Liked!');
          this.getPost(this.postId);
    
        }, (err) => {
    
          
    
          if (err.status) {
            
          } else {
          
          }
    
        });
      }
  
      
  

    }

  
  }

  unlikepost(){

    const post = {
      'post_id': this.postId,
      'user_id': this.user_data.user_id
    };

    this.postService.unlike(post)
    .subscribe((res) => {

   //   console.log('Post Unliked!');
      this.getPost(this.postId);


    }, (err) => {

  

      if (err.status) {
      
      } else {
       
      }

    });

  }



}
