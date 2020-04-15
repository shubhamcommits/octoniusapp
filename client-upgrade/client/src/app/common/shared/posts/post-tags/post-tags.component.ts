import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';


@Component({
  selector: 'app-post-tags',
  templateUrl: './post-tags.component.html',
  styleUrls: ['./post-tags.component.scss']
})
export class PostTagsComponent implements OnInit {

  constructor(public utilityService: UtilityService) { }

  // User Data Variable
  @Input('userData') userData: any

  // GroupId Data Variable
  @Input('groupId') groupId: any;

  // Tags Output Emitter
  @Output('tags') tagEmitter = new EventEmitter()

  // Tags array
  tags: any = []

  ngOnInit() {
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  /**
   * This function adds the new tag into tags array
   * @param tag 
   */
  addNewTag(tag: any) {

    // Push new tag into the array
    this.tags.push(tag)

    // Emit the tags to other components
    this.tagEmitter.emit(this.tags)
  }

  /**
   * This function removes the tag from the tags list
   * @param index 
   */
  removeTag(index: any) {

    // Remove the tag from the desired index
    this.tags.splice(index, 1)

    // Emit the tags to other components
    this.tagEmitter.emit(this.tags)
  }

}
