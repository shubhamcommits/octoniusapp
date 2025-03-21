import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';

@Component({
  selector: 'app-like-story',
  templateUrl: './like-story.component.html',
  styleUrls: ['./like-story.component.scss']
})
export class LikeStoryComponent implements OnInit, OnChanges {

  @Input() storyData: any;
  @Input() userData: any;

  @Output() storyLiked = new EventEmitter();
  @Output() storyUnLiked = new EventEmitter();

  likedByUser = false;

  constructor(
    private loungeService: LoungeService
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    const index = (this.storyData && this.storyData._liked_by) ? this.storyData._liked_by.findIndex(liked => (liked._id || liked) == this.userData?._id) : -1;
    this.likedByUser = index >= 0;
  }

  /**
   * Like the Story
   */
  likeStory(){

    // Call the Service Function to like a Story
    this.loungeService.likeStory(this.storyData._id).then(res => {

      // Add the userId to the storyData._liked_by array
      // this.storyData._liked_by.push(this.userData._id)
      this.storyData = res['story'];
      this.storyLiked.emit(this.storyData);
    });
  }

  /**
   * Unlike the story
   */
  unlikeStory() {
    // Call the Service Function to unlike a story
    this.loungeService.unlikeStory(this.storyData._id).then(res => {
      /*
      // Find the index of where the userId is located
      let userIndex = this.storyData._liked_by.findIndex((userId: any) => userId === this.userData._id)
      // Remove the userId from the array
      this.storyData._liked_by.splice(userIndex, 1)
      */
      this.storyData = res['story'];
      this.storyUnLiked.emit(this.storyData);
    });
  }
}
