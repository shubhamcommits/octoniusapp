import { Component, OnInit,EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { DocumentFileService } from '../../services/document-file.service';

@Component({
  selector: 'app-document-file',
  templateUrl: './document-file.component.html',
  //template: `<div>${editorAsFile.outerHTML}</div>`,
  styleUrls: ['./document-file.component.scss']
})
export class DocumentFileComponent implements OnInit {

  documentHTML: any;
  quill: any;
  postId: any;
  groupId: any;
  document_name:String;

  // @Output() clickBack: EventEmitter<any> = new EventEmitter();

  constructor(private _activatedRoute: ActivatedRoute, 
    private _router: Router,
    private documentService: DocumentService,
    private documentFileService: DocumentFileService) { 
    //this.documentHTML = this._activatedRoute.snapshot.queryParamMap.get('html') || '<div>Please Export your Document!</div>';
    this.postId = this._activatedRoute.snapshot.paramMap.get('postId')
    this.groupId = this._activatedRoute.snapshot.paramMap.get('id');
    this.getDocument();
  }

  async ngOnInit() {
   //await this.getDocument();
  }

  getDocument(){
      this.documentFileService.getDocumentFile(this.postId)
      .subscribe((res)=>{
        this.documentHTML = res['file'][0]['_content'];
        this.document_name = res['file'][0]['_name']
      }, (err)=>{
        console.log('Error occured while fetching the document', err);
      })

  }
  clickOnBack(){
   this._router.navigate(['dashboard', 'group', this.groupId, 'files']);
  }

}
