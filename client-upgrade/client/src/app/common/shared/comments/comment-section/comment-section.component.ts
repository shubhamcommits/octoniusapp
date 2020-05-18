import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';

@Component({
  selector: 'comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit {

  constructor() { }

  // EditorId of the Quill Comment Content
  @Input('editorId') editorId: any;

  ngOnInit() {
  }

  getQuillData(quillData: any){
    console.log(quillData)
  }

}
