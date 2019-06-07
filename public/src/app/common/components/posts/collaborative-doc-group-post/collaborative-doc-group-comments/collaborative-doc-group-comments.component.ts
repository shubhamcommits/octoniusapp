import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, AfterViewInit, ViewChild} from '@angular/core';
import { PostService } from '../../../../../shared/services/post.service';
import { quill } from '../collaborative-doc-group-post.component';
import { SnotifyService, SnotifyPosition, SnotifyToastConfig } from 'ng-snotify';

@Component({
  selector: 'app-collaborative-doc-group-comments',
  templateUrl: './collaborative-doc-group-comments.component.html',
  styleUrls: ['./collaborative-doc-group-comments.component.scss']
})
export class CollaborativeDocGroupCommentsComponent implements OnInit {

  constructor(private postService: PostService,
    private snotifyService: SnotifyService) { }

  @Input('post') post: any;
  @Input('group') group;
  @Input('user') user;
  @Input('user_data') user_data: any;
  @Input('allMembersId') allMembersId;
  @Input('socket') socket;
  @Input('modules') modules;
  @Input('comments') comments;
  @Input('comments_count') comments_count;
  @Output('deletePost') removePost = new EventEmitter();

  // COMMENT DATA
  // the total amount of comments that this post has
  // the comments we loaded from the server
  // the comment object for when we're creating a comment
  comment = {
    content: '',
    _commented_by: '',
    _post_id: '',
    _highlighted_content_range: {
      index: 0,
      length: 0
    }
  };

  toggle_comments = false;

  nextCommentCount = 0;

  async ngOnInit() {
    //this.commentCount = this.post.comments_count;
  }

  selectHighlightedText(range){
    if(range != null && range.length > 1){
      quill.setSelection(range.index, range.length);
      let s = window.getSelection();
      let oRange = s.getRangeAt(0); //get the text range
      let oRect = oRange.getBoundingClientRect(); 
      window.scrollTo(0, oRect['y']);
    }
    else{
      this.snotifyService.simple(`This is a general comment!`, {
        timeout: 500,
        showProgressBar: false,
        backdrop:0.5,
        position: "bottomRight"
      });
    }

    //console.log(oRect, oRange, s);
  }

  commentReceived($event){
    //console.log('Comment received', $event);
    this.comments_count++ ;
    const comment = $event;
    this.comments = [comment, ... this.comments];
    this.highlightAllTheComments(this.comments);
  }

  highlightAllTheComments(comments){
    if(this.comments_count > 0 ){
      for(let i = 0; i < comments.length; i++){
        if(comments[i].hasOwnProperty('_highlighted_content_range')){
          quill.formatText(comments[i]._highlighted_content_range.index, comments[i]._highlighted_content_range.length, {
            background: "#fff72b"
          });
        }
      }
    }

  }

  deselectAllTheComments(comments){
    if(this.comments_count > 0){
      for(let i = 0; i < comments.length; i++){
        if(comments[i].hasOwnProperty('_highlighted_content_range')){
          quill.formatText(comments[i]._highlighted_content_range.index, comments[i]._highlighted_content_range.length, {
            background: "#fff"
          });
        }
      }
    }
  }

  getComments(){
    return new Promise((resolve, reject)=>{
      this.postService.getComments(this.post._id)
      .subscribe((res)=>{
        //console.log('Comments for this post', res);
        this.comments = res['comments'];
        this.highlightAllTheComments(this.comments);
        this.nextCommentCount = this.comments_count- this.comments.length;
        resolve();
      }, (err)=>{
        console.log('Error while fetching comments', err);
        reject(err);
      })
    })
  }

  loadPreviousComments(){
    const firstCommentId = this.comments[this.comments.length-1]._id;
    //console.log('post', this.post);
    return new Promise((resolve, reject)=>{
      this.postService.getNextComments(this.post._id, firstCommentId)
      .subscribe((res)=>{
        //console.log('Next Comments for this post', res);
        this.comments = this.comments.concat(res['comments']);
        this.highlightAllTheComments(this.comments);
        this.nextCommentCount = this.comments_count- this.comments.length;
        //this.post.comments = this.comments;
        //console.log('Next comments', this.comments);
        resolve();
      }, (err)=>{
        console.log('Error while fetching comments', err);
        reject(err);
      })
    })
  }

  deleteComment(commentId){
    return new Promise((resolve, reject)=>{
      this.postService.deleteComment(commentId)
      .subscribe((res)=>{
        //console.log('Comment Deleted', res);
        const index = this.comments.findIndex((comment) => commentId == comment._id);
        this.comments.splice(index, 1);
        this.highlightAllTheComments(this.comments);
        this.comments_count--;
        this.nextCommentCount = this.comments_count- this.comments.length;
        resolve();
      }, (err)=>{
        console.log('Error while deleting comment', err);
        reject(err);
      })
    })
  }

}
