import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-editor',
  templateUrl: './form-editor.component.html',
  styleUrls: ['./form-editor.component.scss']
})
export class FormEditorComponent implements OnInit {

  public hoverImg: string = '<img src="https://mdbootstrap.com/img/logo/mdb192x192.jpg"/>';


  constructor() { }

  ngOnInit(): void {
  }

}
