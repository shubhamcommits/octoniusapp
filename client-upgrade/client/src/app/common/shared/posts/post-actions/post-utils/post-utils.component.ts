import { Component, OnInit, Input } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-post-utils',
  templateUrl: './post-utils.component.html',
  styleUrls: ['./post-utils.component.scss']
})
export class PostUtilsComponent implements OnInit {

  constructor(
    public utilityService: UtilityService,
  ) { }

  // Post Object 
  @Input('post') post: any

  ngOnInit(){
  }

  ngAfterViewInit() {
  }

  openEditPostModal(content: any){
    return this.utilityService.openModal(content, {
      size: 'xl'
    })
  }

}
