import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-follow-post',
  templateUrl: './follow-post.component.html',
  styleUrls: ['./follow-post.component.scss']
})
export class FollowPostComponent implements OnInit {

  constructor() { }

  // Post Data
  @Input('post') post: any;

  // User Data Variable
  @Input('userData') userData: any;

  ngOnInit() {
  }

  /**
   * Follow the post
   */
  followPost(){

    // Add the userId to the post._followers array
    this.post._followers.push(this.userData._id)

    // Increment the likes count by 1
    this.post.followers_count += 1
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
    this.post.followers_count -= 1
  }

  /**
   * Check if the post is followed by the currently loggedIn user
   */
  isFollowedByUser() {
    if (this.post._followers.includes(this.userData._id))
      return true;
    else
      return false
  }

}
