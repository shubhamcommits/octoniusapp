import { Component, OnInit, Injector, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { retry } from 'rxjs/internal/operators/retry';

@Component({
  selector: 'app-group-activity-feed',
  templateUrl: './group-activity-feed.component.html',
  styleUrls: ['./group-activity-feed.component.scss']
})
export class GroupActivityFeedComponent implements OnInit {


  constructor(
    private router: ActivatedRoute,
    private injector: Injector,
    public utilityService: UtilityService,
    private socketService: SocketService, ) { }

  // Fetch groupId from router snapshot or as an input parameter
  @Input('groupId') groupId = this.router.snapshot['_urlSegment']['segments'][2]['path'];

  // My Workplace variable check
  myWorkplace: boolean = (this.router.snapshot['_urlSegment']['segments'][2]['path'] === 'workplace')

  // Global Feed Variable check
  globalFeed: boolean = (this.router.snapshot['_urlSegment']['segments'][2]['path'] === 'inbox')

  // Current Group Data
  groupData: any;

  // Current User Data
  userData: any;

  // Posts map
  posts = new Map()

  // More to load maintains check if we have more to load members on scroll
  public moreToLoad: boolean = true;

  // Variable for lastPostId
  lastPostId: string;

  // Show New posts variable
  showNewPosts = false

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // Subsink Object
  subSink = new SubSink();

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);


  async ngOnInit() {

    // Start the loading spinner
    this.isLoading$.next(true);

    // If my workplace is true, hence we don't have the group header therefore fetch the group details via calling HTTP Request
    if (this.myWorkplace === true)
      this.fetchCurrentGroupData()

    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService)

    // Fetch current group from the service
    this.subSink.add(utilityService.currentGroupData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;
      }
    }))

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the first 5 posts from the server
    await this.fetchPosts(this.groupId)

    // Return the function via stopping the loader
    return this.isLoading$.next(false);

  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  /**
   * emitting the @event postAdded to let the server know to give back the post data details
   */
  emitNewPostSocket(postData: any) {

    // Adding workspace property
    postData.workspace = this.userData.workspace_name;

    // Adding group property
    postData.group = this.groupId;

    // Emit the postAdded socket to the entire room
    this.subSink.add(this.socketService.onEmit('postAdded', postData)
      .pipe(retry(Infinity))
      .subscribe());
  }

  /**
   * This function fetches current group data
   */
  async fetchCurrentGroupData() {

    // Fetch the group data from HTTP Request
    this.groupData = await this.publicFunctions.getGroupDetails(this.groupId)

    if (this.groupData) {

      // Send the updates of the groupdata through shared service
      this.publicFunctions.sendUpdatesToGroupData(this.groupData)
    }
  }

  /**
   * This function is responsible for emitting the post object to other components
   * @param post 
   */
  getPost(post: any) {

    // Set the Show New Posts to be true
    this.showNewPosts = true;

    this.emitNewPostSocket(post)

    console.log(post)

  }

  /**
   * This function removes the post from the posts Map
   * @param post 
   */
  deletePost(post: any) {

    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {

          // Find the key(postId) and remove the post
          this.posts.delete(post._id)
        }
      })
  }

  /**
   * This function refreshes the feed and fetches the updated posts from the server
   */
  async newPosts() {

    // Clear the Posts Map
    this.posts.clear()

    this.moreToLoad = true

    // Start the loading spinner
    this.isLoading$.next(true);

    // Fetch the posts on scroll load
    await this.fetchPosts(this.groupId)

    // Set the Loading State of ShowNewposts to be false
    this.showNewPosts = !this.showNewPosts

    // Stop the loading spinner
    return this.isLoading$.next(false);
  }

  /**
   * This function fetches the set of posts for the activity
   * @param groupId 
   * @param lastPostId 
   */
  async fetchPosts(groupId?: string, lastPostId?: string) {

    // Fetch the set of posts from the server
    let posts: any;

    // If the activity feed is not the global feed
    if (!this.globalFeed)
      posts = await this.publicFunctions.getPosts(groupId, 'group', lastPostId)

    // If the acitvity feed is the global feed
    else if (this.globalFeed) {

      // Fetch the feed
      let feed: any = await this.publicFunctions.getGlobalFeed()

      // Map all types of posts into array
      posts = [...feed.events, ...feed.tasks, ...feed.posts]
    }

    // If post has no content, then set the moreToLoad to false
    if (posts.length == 0) {
      this.moreToLoad = false
    }

    // Else if moreToLoad is true
    if (this.moreToLoad) {

      // Set the value of posts into the map
      posts.forEach((post: any) => {
        this.posts.set(post._id, post);
      })

      // Calculate the lastPostId from the currently fetched posts
      this.lastPostId = posts[posts.length - 1]._id

      // If GLobal Feed is true then set the moreToLoad to false
      if (this.globalFeed)
        this.moreToLoad = false
    }

  }

  /**
   * Scroll Function Event Handler
   */
  public async onScroll() {

    if (this.moreToLoad) {

      // Start the loading spinner
      this.isLoading$.next(true);

      // Fetch the posts on scroll load
      if (!this.globalFeed)
        await this.fetchPosts(this.groupId, this.lastPostId)

      // Stop the loading spinner
      this.isLoading$.next(false);
    }
  }

  /**
   * This function is responsible for sorting the map into reverse order,
   * It compares the integer key and sorts them in descedning order aka most recent first in the activity
   * @param a 
   * @param b 
   */
  compare(a: any, b: any) {
    return parseInt(a.key, 20) > parseInt(b.key, 20) ? -1 :
      (parseInt(a.key, 20) > parseInt(b.key, 20) ? 1 : 0);
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
  }
}
