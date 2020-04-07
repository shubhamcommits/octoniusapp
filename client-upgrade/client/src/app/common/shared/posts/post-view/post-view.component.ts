import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.scss']
})
export class PostViewComponent implements OnInit {

  constructor() { }

  // Base Url for uploads
  baseUrl = environment.UTILITIES_BASE_URL 
  
  // Date Object for undefined dates
  date = Date.now()

  // Post as the Input from component
  @Input('post') post: any;

  ngOnInit() {
  }

}
