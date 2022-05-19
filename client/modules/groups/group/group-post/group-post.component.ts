import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'app-group-post',
  templateUrl: './group-post.component.html',
  styleUrls: ['./group-post.component.scss']
})
export class GroupPostComponent implements OnInit {

  constructor(
    private injector: Injector,
    private _activatedRoute: ActivatedRoute
  ) { }

  // PostId Object
  postId = this._activatedRoute.snapshot.paramMap.get('postId');

  // User Data Object
  userData: any

  groupData: any;

  // Post Object
  post: any

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  async ngOnInit() {

    // Start the loading spinner
    this.isLoading$.next(true);

    // Fetch the post details via calling the HTTP Request
    this.post = await this.publicFunctions.getPost(this.postId);

    // Fetch Current User
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch Current Group
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  editedPost(event: any) {
    this.post = event;
  }

}
