import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { CommentService } from 'src/shared/services/comment-service/comment.service';
import { rejects } from 'assert';

@Component({
  selector: 'comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit {

  constructor(
    private commentService: CommentService
  ) { }

  // EditorId of the Quill Comment Content
  @Input('editorId') editorId: any

  // GroupId Input Variable
  @Input('groupId') groupId: any

  // User Data Variable
  @Input('userData') userData: any

  @Input('postId') postId: any;

  // Comment Emitter
  @Output('comment') comment: any = new EventEmitter()

  // Close Comment Editor
  @Output('close') close: any = new EventEmitter();

  // Quill Data Variable
  quillData: any

  _content_mentions: any;

  ngOnInit() {
  }

  /**
   * This function is responsible for feeding the quill data from current instance
   * @param quillData 
   */
  getQuillData(quillData: any){
    this.quillData = quillData
  }

  /**
   * This function is resposible for creating the comment
   * @param userId 
   */
  create(userId: string){

    let comment = {
      content: JSON.stringify(this.quillData.contents),
      created_date: new Date(Date.now()),
      likes_count: 0,
      _liked_by: [],
      _commented_by:{
        _id: userId,
        profile_pic: this.userData.profile_pic,
        first_name: this.userData.first_name,
        last_name: this.userData.last_name
      }
    }

    // Filter the Mention users content and map them into arrays of Ids
    this._content_mentions = this.quillData.mention.users.map((user)=> user.insert.mention.id)

    // If content mentions has 'all' then only pass 'all' inside the array
    if(this._content_mentions.includes('all'))
      this._content_mentions = ['all']

    // Set the values of the array
    this._content_mentions = Array.from(new Set(this._content_mentions))

    this.newComment(comment)
    this.comment.emit(comment)
  }

  newComment(comment){
    return new Promise((resolve, reject)=>{
      this.commentService.new(this.postId, comment.content, this._content_mentions, [])
      .then((res)=>{
        console.log(res);
        // Output the Comment
        // this.comment.emit(comment)
        resolve( res['comment'])
      })
      .catch(()=>{
        reject()
      })
    })
  }

}
