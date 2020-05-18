import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';

@Component({
  selector: 'comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit {

  constructor() { }

  // EditorId of the Quill Comment Content
  @Input('editorId') editorId: any

  // GroupId Input Variable
  @Input('groupId') groupId: any

  // User Data Variable
  @Input('userData') userData: any

  // Comment Emitter
  @Output('comment') comment: any = new EventEmitter()

  // Close Comment Editor
  @Output('close') close: any = new EventEmitter();

  // Quill Data Variable
  quillData: any

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
      likes_count: 0,
      _liked_by: [],
      _commented_by:{
        _id: userId,
        profile_pic: this.userData.profile_pic,
        first_name: this.userData.first_name,
        last_name: this.userData.last_name
      }
    }

    // Output the Comment
    this.comment.emit(comment)
  
  }

}
