import { Component, OnInit, OnChanges, Input, Output, EventEmitter, Injector } from '@angular/core';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-follow-post',
  templateUrl: './follow-post.component.html',
  styleUrls: ['./follow-post.component.scss']
})
export class FollowPostComponent implements OnInit, OnChanges {

  // Post Data
  @Input('post') post: any;

  // User Data Variable
  @Input('userData') userData: any;

  @Output() postLiked = new EventEmitter();
  @Output() postUnLiked = new EventEmitter();

  isFollowedByUser: boolean = false;

  constructor(private _injector: Injector) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.isFollowedByUser = (this.post.hasOwnProperty('_followers') && this.post._followers.findIndex(follower => (follower?._id || follower) === this.userData?._id)>=0)
      ? true : false;
  }

  /**
   * Follow the post
   */
  followPost(){

    // Add the userId to the post._followers array
    this.post._followers.push(this.userData._id)

    // Increment the likes count by 1
    this.post.followers_count += 1

    this.isFollowedByUser = true;

    this.postLiked.emit(this.userData._id);

    this.onFollowPost(this.post._id);
  }

  /**
   * Unfollow the post
   */
  unfollowPost(){

    // Find the index of where the userId is located
    let userIndex = this.post._followers.findIndex((userId: any) => userId === this.userData._id)

    // Remove the userId from the array
    this.post._followers.splice(userIndex, 1)

    // Decrement the likes count by 1
    this.post.followers_count -= 1;

    this.isFollowedByUser = false;

    this.postUnLiked.emit(this.userData);

    this.onUnfollowPost(this.post._id);
  }

  /**
   * This function is responsible for calling the HTTP request to like a post
   * @param postId
   */
  onFollowPost(postId: string){

    // Post Service Instance
    let postService = this._injector.get(PostService)

    // Return a new promise to call the service function
    return new Promise((resolve, reject)=>{
      postService.follow(postId)
      .then((res)=> {
        resolve(res);
      })
      .catch((err)=>{
        reject()
      })
    })
  }

  /**
   * This function is responsible for calling the HTTP request to unlike a post
   * @param postId
   */
  onUnfollowPost(postId: string){

    // Post Service Instance
    let postService = this._injector.get(PostService)

    // Return a new promise to call the service function
    return new Promise((resolve, reject)=>{
      postService.unfollow(postId)
      .then((res)=> {
        resolve(res);
      })
      .catch((err)=>{
        reject()
      })
    })
  }

}
