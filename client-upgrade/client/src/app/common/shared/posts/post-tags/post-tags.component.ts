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

  addNewTag($event){
    console.log($event)
  }

  removeTag(tag, index){

  }

}
