import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { LibraryService } from 'src/shared/services/library-service/library.service';

@Component({
  selector: 'app-like-page',
  templateUrl: './like-page.component.html',
  styleUrls: ['./like-page.component.scss']
})
export class LikePageComponent implements OnInit, OnChanges {

  @Input() pageData: any;
  @Input() userData: any;

  @Output() pageLiked = new EventEmitter();
  @Output() pageUnLiked = new EventEmitter();

  likedByUser = false;

  constructor(
    private libraryService: LibraryService
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    const index = (this.pageData && this.pageData._liked_by) ? this.pageData._liked_by.findIndex(liked => (liked._id || liked) == this.userData?._id) : -1;
    this.likedByUser = index >= 0;
  }

  /**
   * Like the Page
   */
  likePage(){

    // Call the Service Function to like a Page
    this.libraryService.likePage(this.pageData._id).then(res => {
      this.pageData = res['page'];
      this.likedByUser = true;
      this.pageLiked.emit(this.pageData);
    });
  }

  /**
   * Unlike the page
   */
  unlikePage() {
    // Call the Service Function to unlike a page
    this.libraryService.unlikePage(this.pageData._id).then(res => {
      this.pageData = res['page'];
      this.likedByUser = false;
      this.pageUnLiked.emit(this.pageData);
    });
  }
}
