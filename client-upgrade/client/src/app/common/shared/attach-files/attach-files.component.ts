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

  // Files Array
  filesArray = new Array<File>()

  ngOnInit() {
  }

  /**
   * This function returns an array of files attached with the input
   * @param files 
   */
  onAttach(files: any){

    // Set the files array to the incoming output
    this.filesArray = files.target.files;

    // Emit the value to other components
    return this.files.emit(this.filesArray)
  }

  /**
   * This function is responsible for removing the specific file attached
   * @param index 
   */
  removeFile(index: number){

    // Remove element at the specific index
    let arr = Array.from(this.filesArray)

    // Remove the element
    arr.splice(index, 1)

    // Updated array
    this.filesArray = arr

    // Emit the value to other components
    return this.files.emit(this.filesArray)
  }

}
