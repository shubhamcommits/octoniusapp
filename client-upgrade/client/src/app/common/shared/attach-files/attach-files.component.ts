import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-attach-files',
  templateUrl: './attach-files.component.html',
  styleUrls: ['./attach-files.component.scss']
})
export class AttachFilesComponent implements OnInit {

  constructor() { }

  // Files Output Event Emitter
  @Output('files') files = new EventEmitter();

  ngOnInit() {
  }

  /**
   * This function returns an array of files attached with the input
   * @param files 
   */
  onAttach(files: any){
    return this.files.emit(<Array<File>>files.target.files)
  }

}
