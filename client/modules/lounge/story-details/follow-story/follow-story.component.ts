import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';

@Component({
  selector: 'app-follow-story',
  templateUrl: './follow-story.component.html',
  styleUrls: ['./follow-story.component.scss']
})
export class FollowStoryComponent implements OnInit {

  @Input() storyData: any;
  @Input() userData: any;

  @Output() storyFollowed = new EventEmitter();
  @Output() storyUnfollowed = new EventEmitter();

  constructor(
    private loungeService: LoungeService
    ) { }

  ngOnInit() {
  }

  /**
   * Follow the story
   */
  followStory(){

    this.loungeService.followStory(this.storyData._id).then((res)=> {
      // Add the userId to the story._followers array
      // this.storyData._followers.push(this.userData._id)
      this.storyData = res['story']
      this.storyFollowed.emit(this.storyData);
    });
  }

  /**
   * Unfollow the story
   */
  unfollowStory(){

    this.loungeService.unfollowStory(this.storyData._id).then((res)=> {
      /*
      // Find the index of where the userId is located
      let userIndex = this.storyData._followers.findIndex((userId: any) => userId === this.userData._id)

      // Remove the userId from the array
      this.storyData._followers.splice(userIndex, 1)
      */
      this.storyData = res['story'];
      this.storyUnfollowed.emit(this.storyData);
    });
  }

  /**
   * Check if the Story is liked by the currently loggedIn user
   */
  isFollowedByUser() {
    const index = (this.storyData && this.storyData._followers) ? this.storyData._followers.findIndex(follower => (follower._id || follower) == this.userData._id) : -1;
    return index >= 0;
  }
}
