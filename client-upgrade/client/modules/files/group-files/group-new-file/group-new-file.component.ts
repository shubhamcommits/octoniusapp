import { Component, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-group-new-file',
  templateUrl: './group-new-file.component.html',
  styleUrls: ['./group-new-file.component.scss']
})
export class GroupNewFileComponent implements OnInit {

  constructor() { }

  // Output folder event emitter
  @Output('folder') folder: any

  ngOnInit() {
  }

  createFolder(folder: any){
    
  }

}
