import { Component, OnInit } from '@angular/core';
import { PostService } from '../../../../shared/services/post.service';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { InputValidators } from '../../../../common/validators/input.validator';

@Component({
  selector: 'app-group-post',
  templateUrl: './group-post.component.html',
  styleUrls: ['./group-post.component.scss']
})
export class GroupPostComponent implements OnInit {

  post;
  user_data;
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

  constructor(private postService: PostService, private _activatedRoute: ActivatedRoute) {
    this.postId = this._activatedRoute.snapshot.paramMap.get('postId');
   
    this.user_data = JSON.parse(localStorage.getItem('user'));
   }

  ngOnInit() {
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


  OnSaveEditPost(index, post_id, content) {

    const editor = document.getElementById('edit-content-'+index);
  const post = {
    'content': document.getElementById(index).innerHTML,
    '_content_mentions': this.content_mentions
  };
  const scanned_content = post.content;
  var el = document.createElement( 'html' );
  el.innerHTML = scanned_content;

  if(el.getElementsByClassName( 'mention' ).length > 0)
  {
   //  console.log('Element',  el.getElementsByClassName( 'mention' ));
  for(var i = 0; i < el.getElementsByClassName( 'mention' ).length; i++)
  {
    this.content_mentions.push(el.getElementsByClassName( 'mention' )[i]['dataset']['id'].toString());
  }

  }
   // console.log('Content Mention', this.content_mentions); 
//  console.log('post: ', post);
  this.postService.editPost(post_id, post)
  .subscribe((res) => {
    // console.log('Normal post response: ', res);
  //  console.log("Post Updated, Successfully!")

  }, (err) => {


    if (err.status) {
      
    } else {
      
    }

  });
    const x = document.getElementById(index);
    const y = document.getElementById("button_edit_post"+index);
  
    x.style.borderStyle="none";
  
    x.style.display="block";
  
    editor.style.display='none';
  
    x.setAttribute('contenteditable', 'false');
  
    y.style.display="none";
  
    x.blur();
  }


}
