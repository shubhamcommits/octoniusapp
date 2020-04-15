import { Component, OnInit, Input } from '@angular/core';
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
  @Input('groupId') groupId: any

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
  addNewTag(tag: any){
    this.tags.push(tag)
  }

  /**
   * This function removes the tag from the tags list
   * @param tag 
   * @param index 
   */
  removeTag(tag: any, index: any){
    this.tags.splice(index, 1)
  }

}
