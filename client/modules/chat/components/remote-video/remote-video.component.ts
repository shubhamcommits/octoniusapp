import { Component, OnChanges, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';


@Component({
  selector: 'app-remote-video',
  templateUrl: './remote-video.component.html',
  styleUrls: ['./remote-video.component.scss']
})
export class RemoteVideoComponent implements OnInit, OnChanges {

  @Input() id: string;
  @Input() stream: any;
  @Input() remoteUser: any;

  constructor(public utilityService: UtilityService) { }

  async ngOnInit() {
  }

  async ngOnChanges() {
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return this.utilityService.objectExists(object);
  }
}
