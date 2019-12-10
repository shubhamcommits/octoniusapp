import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbDropdown} from "@ng-bootstrap/ng-bootstrap";
import * as Quill from "quill";
import {TemplateService} from "../../../../shared/services/template.service";
import {AuthService} from "../../../../shared/services/auth.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-collaborative-doc-modal-templates',
  templateUrl: './collaborative-doc-modal-templates.component.html',
  styleUrls: ['./collaborative-doc-modal-templates.component.scss'],
  providers: [NgbDropdown]
})
export class CollaborativeDocModalTemplatesComponent implements OnInit {
  // @ts-ignore
  @Input() quill: Quill;
  @Input() groupId: string;
  @Input() postTitle: string;

  templates: Array<ITemplate>;
  createTemplateForm: FormGroup;

  constructor(public activeModal: NgbActiveModal,
              private templateService: TemplateService,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.createTemplateForm = new FormGroup({
      description: new FormControl('', Validators.required)
    });

    this.templateService.getTemplates(this.groupId).subscribe(templates => {
      this.templates = templates;
    })
  }

  addTemplateToEditor(template) {
    this.activeModal.close({
      reason: 'addTemplate',
      template: template
    });
  }

  deleteTemplate(template: ITemplate) {
    this.templateService.deleteTemplate(template._id).subscribe(() => this.templates = this.templates.filter(item => item._id !== template._id));
  }

  saveForm(form) {
    if (!this.createTemplateForm.valid) {
      this.createTemplateForm.markAsDirty();
      return;
    }
    const ops = this.quill.getContents().ops;
    ops[ops.length - 2].insert = ops[ops.length - 2].insert.slice(0, -1);
    const template: ITemplate = {
      userId: this.authService.getAuthenticatedUser().user_id,
      groupId: this.groupId,
      title: this.postTitle,
      description: form.description,
      content: ops
    };

    this.templateService.saveTemplate(template).subscribe(data => {
      this.templates.push(data);
      this.createTemplateForm.reset()
    });
  }

}
