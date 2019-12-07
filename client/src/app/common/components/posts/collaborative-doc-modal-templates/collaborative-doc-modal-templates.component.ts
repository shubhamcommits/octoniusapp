import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import * as Quill from "quill";

@Component({
  selector: 'app-collaborative-doc-modal-templates',
  templateUrl: './collaborative-doc-modal-templates.component.html',
  styleUrls: ['./collaborative-doc-modal-templates.component.scss']
})
export class CollaborativeDocModalTemplatesComponent implements OnInit {
  // @ts-ignore
  @Input() quill: Quill;

  templates = [{title: 'title', description: 'description'}, {
    title: 'title',
    description: 'description'
  }, {title: 'title', description: 'description'}, {title: 'title', description: 'description'}, {
    title: 'title',
    description: 'description'
  }]

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    console.log('lalalllal', this.quill.getContents());
  }

}
