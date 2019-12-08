import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import * as Quill from "quill";
import {TemplateService} from "../../../../shared/services/template.service";
import {AuthService} from "../../../../shared/services/auth.service";

@Component({
  selector: 'app-collaborative-doc-modal-templates',
  templateUrl: './collaborative-doc-modal-templates.component.html',
  styleUrls: ['./collaborative-doc-modal-templates.component.scss']
})
export class CollaborativeDocModalTemplatesComponent implements OnInit {
  // @ts-ignore
  @Input() quill: Quill;
  @Input() groupId: string;
  @Input() postTitle: string;

  templates: Array<ITemplate>;
  public template_description: string = '';

  constructor(public activeModal: NgbActiveModal,
              private templateService: TemplateService,
              private authService: AuthService) {
  }

  ngOnInit() {
    console.log(this.postTitle);
    this.templateService.getTemplates(this.groupId).subscribe(templates => {
      console.log('templates here', templates);
      this.templates = templates;
    })
  }

  saveForm(event) {
    console.log('save form', event, this.template_description);
    const template: ITemplate = {
      userId: this.authService.getAuthenticatedUser().user_id,
      groupId: this.groupId,
      title: this.postTitle,
      description: this.template_description,
      content: this.quill.getContents().ops
    };

    this.templateService.saveTemplate(template).subscribe(data => console.log('success', data));
  }

}
