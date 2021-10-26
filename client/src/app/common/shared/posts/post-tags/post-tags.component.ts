import { Component, OnChanges, Input, EventEmitter, Output } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';


@Component({
  selector: 'app-post-tags',
  templateUrl: './post-tags.component.html',
  styleUrls: ['./post-tags.component.scss']
})
export class PostTagsComponent implements OnChanges {

  constructor(public utilityService: UtilityService) { }

  // User Data Variable
  @Input('userData') userData: any

  // GroupId Data Variable
  @Input('groupId') groupId: any;

  // Post Data Variable
  @Input('post') post: any;

  @Input() canEdit = true;

  // Tags Output Emitter
  @Output('tags') tagEmitter = new EventEmitter()

  // Tags array
  tags: any = []

  ngOnChanges() {
    // If post variable exist then add it to existing tags array
    if(this.post){
      this.tags = this.post.tags
    }
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

    if (this.canEdit) {
      // Remove the tag from the desired index
      this.tags.splice(index, 1);

      // Emit the tags to other components
      this.tagEmitter.emit(this.tags);
    }
  }

}
