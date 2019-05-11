import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, AfterViewInit, ViewChild} from '@angular/core';
import { CommentSectionComponent } from '../../../comments/comment-section/comment-section.component';
import { environment } from '../../../../../../environments/environment';
import { PostService } from '../../../../../shared/services/post.service';
import { comment_range, quill } from '../collaborative-doc-group-post.component';

@Component({
  selector: 'app-collaborative-doc-group-post-comment',
  templateUrl: './collaborative-doc-group-post-comment.component.html',
  styleUrls: ['./collaborative-doc-group-post-comment.component.scss']
})
export class CollaborativeDocGroupPostCommentComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private postService: PostService) { }

  @Input('post') post: any;
  @Input('group') group;
  @Input('user') user;
  @Input('user_data') user_data;
  @Input('allMembersId') allMembersId;
  @Input('socket') socket;
  @Input('modules') modules;
  @Output('deletePost') removePost = new EventEmitter();
  @Output('newCommentReceived') newCommentAdded = new EventEmitter();

  date: Date;

  comment_content;

  async ngOnInit() {
    this.date = new Date(Date.now());
  }

  ngAfterViewInit(){
     
  }

  ngOnDestroy() {

  }

  getSelectedPortion(){
    return quill.getSelection();
  }

  addComment(){

    const commentContent = {
      content: ""+this.comment_content,
      _commented_by: this.user._id,
      post_id: this.post._id,
      _highlighted_content_range: comment_range,
      contentMentions: []
    };

    console.log('Comment Range', comment_range);

    this.postService.addNewComment(this.post._id, commentContent)
    .subscribe((res)=>{
      console.log('Comment added', res);
      this.newCommentAdded.emit(res['comment']);
      this.comment_content = null;
    }, (err)=>{
      console.log('Error found', err);
    })
  }

}
