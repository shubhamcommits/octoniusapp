import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-post-actions',
  templateUrl: './post-actions.component.html',
  styleUrls: ['./post-actions.component.scss']
})
export class PostActionsComponent implements OnInit {

  constructor() { }

  // Post Input
  @Input('post') post: any

  ngOnInit() {
  }

}
