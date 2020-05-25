import { Component, OnInit, Input, Injector, EventEmitter, Output } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  constructor(
    public injector: Injector
  ) { }

  // Column as the Input object
  @Input('column') column: any;

  // Post Title Variable
  postTitle: any

  // User Data Object
  @Input('userData') userData: any;

  // Group Data Object
  @Input('groupData') groupData: any;

  // Post Event Emitter
  @Output('post') post = new EventEmitter()

  ngOnInit() {
  }

  /**
   * This function is responsible for enabling enter and espace function keys
   * @param $event 
   * @param column 
   */
  newTask($event: any, column: any){
    if($event.keyCode == 13){
      this.createPost()
    } else if($event.keyCode == 27){
      column.addTask = false
    }
  }

  /**
   * This function creates a new post in the activity
   */
  createPost() {

    // Prepare Post Data
    let postData = {
      title: this.postTitle,
      content: '',
      type: 'task',
      _posted_by: this.userData._id,
      _group: this.groupData._id,
      _content_mentions: [],
      task: {
        unassigned: true,
        status: 'to do',
        _column: {
          title: this.column.title
        }
      }
    }

    // Create FormData Object
    let formData = new FormData();

    // Append Post Data
    formData.append('post', JSON.stringify(postData))

    // Call the Helper Function
    this.onCreatePost(formData, this.post)

    // Clear the postTitle
    this.postTitle = undefined

  }

  /**
   * This function is responsible for calling add post service functions
   * @param postData 
   */
  onCreatePost(postData: FormData, post: EventEmitter<any>) {

    // Create Utility Service Instance
    let utilityService = this.injector.get(UtilityService)
    let postService = this.injector.get(PostService)

    // Asynchronously call the utility service
    utilityService.asyncNotification('Please wait we are creating the post...', new Promise((resolve, reject) => {
      postService.create(postData)
        .then((res) => {

          // Emit the Post to the other compoentns
          post.emit(res['post'])

          // Resolve with success
          resolve(utilityService.resolveAsyncPromise('Task Created!'))
        })
        .catch((err) => {

          // Catch the error and reject the promise
          reject(utilityService.rejectAsyncPromise('Unable to create new task, please try again!'))
        })
    }))
  }

}
