import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'content-search-result',
  templateUrl: './content-search-result.component.html',
  styleUrls: ['./content-search-result.component.scss']
})
export class ContentSearchResultComponent implements OnInit {

  @Input('post') post;
  @Input('deleteable') deleteable;

  @Output('saveSearch') sendSaveSearch = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  saveSearch() {
    this.sendSaveSearch.emit({
      type: 'content',
      content: this.post
    });
  }

}
