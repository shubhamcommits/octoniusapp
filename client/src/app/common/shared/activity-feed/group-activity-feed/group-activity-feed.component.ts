import { Component, OnInit, Injector, Input } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { retry } from 'rxjs/internal/operators/retry';
import { PostService } from 'src/shared/services/post-service/post.service';
import moment from 'moment';

@Component({
  selector: 'app-group-activity-feed',
  templateUrl: './group-activity-feed.component.html',
  styleUrls: ['./group-activity-feed.component.scss']
})
export class GroupActivityFeedComponent implements OnInit {

  // Fetch groupId from router snapshot or as an input parameter
  @Input('groupId') groupId = this.router.snapshot.queryParamMap.get('group');

  // My Workplace variable check
  myWorkplace: boolean = this.router.snapshot.queryParamMap.has('myWorkplace')
    ? (this.router.snapshot.queryParamMap.get('myWorkplace') == ('false') ? (false) : (true))
    : false

  // Global Feed Variable check
  globalFeed: boolean = (this.router.snapshot.url.findIndex((segment) => segment.path == 'inbox') == -1) ? false : true

  // Current Group Data
  groupData: any;

  isProjectType = false;

  // Current User Data
  userData: any;

  // Posts map
  posts = new Map();

  // Pinned posts
  pinnedPosts = [];

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

  columns;

  constructor(
    private router: ActivatedRoute,
    private _router: Router,
    private injector: Injector,
    public utilityService: UtilityService,
    private socketService: SocketService,
    private postService: PostService
  ) {

    this.subSink.add(this._router.events.subscribe(async (e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        // Fetch groupId from router snapshot or as an input parameter
        this.groupId = this._router.routerState.snapshot.root.queryParamMap.get('group')

        // My Workplace variable check
        this.myWorkplace = this._router.routerState.snapshot.root.queryParamMap.has('myWorkplace')
          ? (this._router.routerState.snapshot.root.queryParamMap.get('myWorkplace') == ('false') ? (false) : (true))
          : false

        // Global Feed Variable check
        this.globalFeed = (this._router.routerState.snapshot.root.url.findIndex((segment) => segment.path == 'inbox') == -1) ? false : true

        this.posts.clear()

        this.showNewPosts = false;

        this.moreToLoad = true;
      }
    }));
  }

  async ngOnInit() {
    this._router.routeReuseStrategy.shouldReuseRoute = () => false;

    // Start the loading spinner
    this.isLoading$.next(true);

    this.publicFunctions.getAllColumns(this.groupId).then(data => this.columns = data);

    // If my workplace is true, hence we don't have the group header therefore fetch the group details via calling HTTP Request
    if (this.myWorkplace === true)
      this.fetchCurrentGroupData()

    if (this.myWorkplace === false) {

      // Posted Added in Group Socket
      this.subSink.add(this.enableAddPostInGroupSocket(this.socketService))

      // Post Edited in Group Socket
      this.subSink.add(this.enableEditPostInGroupSocket(this.socketService))

      // Post Deleted in Group Socket
      this.subSink.add(this.enableDeletePostInGroupSocket(this.socketService))
    }

    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService)

    // Fetch current group from the service
    this.subSink.add(utilityService.currentGroupData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res

        this.isProjectType = this.groupData.project_type;
      }
    }))

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the first 5 posts from the server
    await this.fetchPosts(this.groupId);

    // pinned/unpinned posts
    await this.postService.getPosts(this.groupId, 'pinned', true).then(res => {
      this.pinnedPosts = res['posts'];
    });

    if (this._router.routerState.snapshot.root.queryParamMap.has('postId')) {
      const postId = this._router.routerState.snapshot.root.queryParamMap.get('postId');
      const post = await this.publicFunctions.getPost(postId);
      let dialogRef;
      if (post['type'] === 'task') {
        dialogRef = this.utilityService.openCreatePostFullscreenModal(post, this.userData, this.groupId, this.columns);
      } else {
        dialogRef = this.utilityService.openCreatePostFullscreenModal(post, this.userData, this.groupId);
      }

      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.editedPost(data);
      });
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
      });
    }

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
    this.isLoading$.complete()
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
   * This function enables the post data sharing over the socket
   * @param publicFunctions
   * @param socketService
   * calling the @event postAddedInGroup to notify user about newly added post in a group
   */
  enableAddPostInGroupSocket(socketService: SocketService) {
    return socketService.onEvent('postAddedInGroup')
      .pipe(retry(Infinity))
      .subscribe((post) => {
        // Show new posts
        // if(post.group === this.groupId)
          this.showNewPosts = true;
      });
  }

  /**
   * This function enables the post data sharing over the socket
   * @param publicFunctions
   * @param socketService
   * calling the @event postEditedInGroup to notify user about a post which got edited in a group
   */
  enableEditPostInGroupSocket(socketService: SocketService) {
    return socketService.onEvent('postEditedInGroup')
      .pipe(retry(Infinity))
      .subscribe((post) => {
      });
  }

  /**
   * This function enables the post data sharing over the socket
   * @param publicFunctions
   * @param socketService
   * calling the @event postDeletedInGroup to notify user about a post which was deleted from a group
   */
  enableDeletePostInGroupSocket(socketService: SocketService) {
    return socketService.onEvent('postDeletedInGroup')
      .pipe(retry(Infinity))
      .subscribe((post) => {
      });
  }

  /**
   * This function fetches current group data
   */
  async fetchCurrentGroupData() {

    // Fetch the group data from HTTP Request
    if(this.groupId != null || this.groupId != undefined) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails(this.groupId);
    }
  }

  /**
   * This function is responsible for emitting the post object to other components
   * @param post
   */
  getPost(post: any) {

    // Set the Show New Posts to be true
    this.showNewPosts = true;

    this.emitNewPostSocket(post);
  }

  /**
   * This function removes the post from the posts Map
   * @param post
   */
  deletePost(post: any) {
    new Promise((resolve, reject)=>{
      this.postService.deletePost(post._id).then((res)=>{
         // Find the key(postId) and remove the post
        this.posts.delete(post._id);
        if (post.pin_to_top) {
          const postIndex = this.pinnedPosts.findIndex((postTmp) => postTmp._id == post._id);
          this.pinnedPosts.splice(postIndex, 1);
        }

        resolve({});
      }).catch((err)=>{
        reject();
      })
    });
  }

  editedPost(event: any) {
    this.posts.set(event._id, event);
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
    if (!this.globalFeed) {
      posts = await this.publicFunctions.getPosts(groupId, 'normal', false, lastPostId);
    }

    // If the acitvity feed is the global feed
    else if (this.globalFeed) {

      // Fetch the feed
      let feed: any = await this.publicFunctions.getGlobalFeed()

      // Map all types of posts into array
      posts = [...feed.events, ...feed.tasks, ...feed.posts]
    }

    // If post has no content, then set the moreToLoad to false
    // I had to add the "|| posts.value" because when posts is empty sometimes the service is returning a none array element.
    if (posts.length === 0 || posts.value) {
      this.moreToLoad = false
    }

    // Else if moreToLoad is true
    if (this.moreToLoad) {
      for (let post of posts) {
        this.posts.set(post._id, post);
      }

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

  onPostPin(postData: any) {
    if (postData.pin) {
      const post = this.posts.get(postData._id);
      this.posts.delete(postData._id);
      this.pinnedPosts.push(post);
    } else {
      const postIndex = this.pinnedPosts.findIndex((post) => post._id == postData._id);
      const post = this.pinnedPosts[postIndex];
      this.pinnedPosts.splice(postIndex, 1);
      if (post) {
        this.posts.set(post._id, post);
      }
    }
    this.pinnedPosts.sort((p1, p2) => {
        return (moment.utc(p1.created_date).isBefore(p2.created_date)) ? -1 : 1;
      });

    this.posts = new Map([...this.posts.entries()].sort((p1, p2) => {
        return (moment.utc(p1['created_date']).isBefore(p2['created_date'])) ? -1 : 1;
      }));
  }
}
