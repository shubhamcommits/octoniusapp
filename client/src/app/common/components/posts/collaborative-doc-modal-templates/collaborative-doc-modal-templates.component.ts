import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-collaborative-doc-modal-templates',
  templateUrl: './collaborative-doc-modal-templates.component.html',
  styleUrls: ['./collaborative-doc-modal-templates.component.scss']
})
export class CollaborativeDocModalTemplatesComponent implements OnInit {
  @Input() name;
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
  }

}
