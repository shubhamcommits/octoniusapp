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
import { GroupService } from 'src/shared/services/group-service/group.service';

@Component({
  selector: 'app-group-activity-feed',
  templateUrl: './group-activity-feed.component.html',
  styleUrls: ['./group-activity-feed.component.scss']
})
export class GroupActivityFeedComponent implements OnInit {

  @Input() isIdeaModuleAvailable;

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
  posts = [];

  // Pinned posts
  pinnedPosts = [];
  keepPinnedOpen = false;

  filters = {};

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

        this.posts = [];

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
        this.keepPinnedOpen = this.groupData.keep_pinned_open;
      }
    }))

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the first 5 posts from the server
    await this.fetchPosts(this.groupId);

    // pinned/unpinned posts
    await this.fetchPinnedPosts();

    if (this._router.routerState.snapshot.root.queryParamMap.has('postId')) {
      const postId = this._router.routerState.snapshot.root.queryParamMap.get('postId');
      const post = await this.publicFunctions.getPost(postId);
      let dialogRef;
      if (post['type'] === 'task') {
        dialogRef = this.utilityService.openCreatePostFullscreenModal(post, this.userData, this.groupData, this.isIdeaModuleAvailable, this.columns);
      } else {
        dialogRef = this.utilityService.openCreatePostFullscreenModal(post, this.userData, this.groupData, this.isIdeaModuleAvailable);
      }

      if (dialogRef) {
        const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
          this.editedPost(data);
        });
        dialogRef.afterClosed().subscribe(result => {
          closeEventSubs.unsubscribe();
        });
      }
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
    if (this.groupId != null || this.groupId != undefined) {
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
         const index = this.posts.findIndex((postTmp) => postTmp._id == post._id);
        this.posts.splice(index, 1);
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
    this.posts.push(event);
  }

  /**
   * This function refreshes the feed and fetches the updated posts from the server
   */
  async newPosts() {

    // Clear the Posts Map
    this.posts = [];

    this.moreToLoad = true

    // Start the loading spinner
    this.isLoading$.next(true);

    // Fetch the posts on scroll load
    await this.fetchPosts(this.groupId);

    // pinned/unpinned posts
    await this.fetchPinnedPosts();

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
      posts = await this.publicFunctions.getPosts(groupId, 'normal', false, lastPostId, this.filters);
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

    if (this.groupData?.enabled_rights && this.groupData?.rags && this.groupData?.rags.length > 0) {
      posts = posts.filter(post => {
        const hide = this.utilityService.canUserDoAction(post, this.groupData, this.userData, 'hide');
        return this.utilityService.canUserDoAction(post, this.groupData, this.userData, 'view') || !hide;
      });
    }

    // Else if moreToLoad is true
    if (this.moreToLoad) {
      for (let post of posts) {
        const index = this.posts.findIndex(postTmp => postTmp._id == post._id);
        if (index < 0) {
          this.posts.push(post);
        }
      }

      // Calculate the lastPostId from the currently fetched posts
      this.lastPostId = (posts[posts.length - 1]) ? posts[posts.length - 1]?._id : '';

      // If GLobal Feed is true then set the moreToLoad to false
      if (this.globalFeed)
        this.moreToLoad = false
    }
  }

  async fetchPinnedPosts() {
    await this.postService.getPosts(this.groupId, 'pinned', true, null, { tags: this.filters['tags'], users: this.filters['users'] }).then(res => {
      this.pinnedPosts = res['posts'];

      this.pinnedPosts = this.pinnedPosts.filter(post => {
        const hide = this.utilityService.canUserDoAction(post, this.groupData, this.userData, 'hide');
        return this.utilityService.canUserDoAction(post, this.groupData, this.userData, 'view') || !hide;
      });
    });
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

  onPostPin(postData: any) {
    if (postData.pin) {
      const postIndex = this.posts.findIndex((post) => post._id == postData._id);
      const post = this.posts[postIndex];
      this.posts.splice(postIndex, 1);
      this.pinnedPosts.push(post);
    } else {
      const postIndex = this.pinnedPosts.findIndex((post) => post._id == postData._id);
      const post = this.pinnedPosts[postIndex];
      this.pinnedPosts.splice(postIndex, 1);
      if (post) {
        this.posts.push(post);
      }
    }
    this.pinnedPosts.sort((p1, p2) => {
        return (moment.utc(p1.created_date).isBefore(p2.created_date)) ? -1 : 1;
      });

    if (!(this.filters && this.filters['numLikes'] && +(this.filters['numLikes']) > 0)) {
      this.posts = this.posts.sort((p1, p2) => {
        return (moment.utc(p1['created_date']).isBefore(p2['created_date'])) ? -1 : 1;
      });
    }
  }

  async applyFilters(filters: any) {
    // Start the loading spinner
    this.isLoading$.next(true);

    this.filters = filters;

    // Fetch the posts
    this.posts = [];
    let postsTmp: any = [];
    postsTmp = await this.publicFunctions.getPosts(this.groupId, 'normal', false, null, this.filters);
    postsTmp.forEach(post => {
      this.posts.push(post);
    });

    // pinned/unpinned posts
    await this.fetchPinnedPosts();

    if (this.filters && this.filters['numLikes'] && +(this.filters['numLikes']) > 0) {
      this.moreToLoad = false;
    }

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  checker(arr, target) {
    return target.every(v => arr.includes(v));
  }

  isGroupManager() {
    return (this.groupData && this.groupData._admins) ? this.groupData._admins.find(admin => admin._id == this.userData?._id) : false;
  }

  saveSettings(selected) {

    // Utility Service
    let utilityService = this.injector.get(UtilityService);

    // Group Service
    let groupService = this.injector.get(GroupService);

    // Save the settings
    utilityService.asyncNotification($localize`:@@groupActivityFeed.pleaseWaitsavingSettings:Please wait we are saving the new setting...`,
      new Promise((resolve, reject)=>{
        if(selected.source.name === 'keep_pinned_open'){
          groupService.saveSettings(this.groupId, {keep_pinned_open: selected.checked})
          .then(()=> {
            this.keepPinnedOpen = selected.checked;
            this.groupData.keep_pinned_open = selected.checked;
            this.publicFunctions.sendUpdatesToGroupData(this.groupData);
            resolve(utilityService.resolveAsyncPromise($localize`:@@groupActivityFeed.settingsSaved:Settings saved to your group!`));
          })
          .catch(() => reject(utilityService.rejectAsyncPromise($localize`:@@groupActivityFeed.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }
      }));
  }
}
