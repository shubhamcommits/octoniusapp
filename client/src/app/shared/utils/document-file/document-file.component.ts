import { Component, OnInit } from '@angular/core';
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

  constructor(private _activatedRoute: ActivatedRoute, 
    private _router: Router,
    private documentService: DocumentService,
    private documentFileService: DocumentFileService) { 
    //this.documentHTML = this._activatedRoute.snapshot.queryParamMap.get('html') || '<div>Please Export your Document!</div>';
    this.postId = this._activatedRoute.snapshot.paramMap.get('postId');
    this.getDocument();
  }

  async ngOnInit() {
   //await this.getDocument();
  }

  getDocument(){
      this.documentFileService.getDocumentFile(this.postId)
      .subscribe((res)=>{
        this.documentHTML = res['file'][0]['_content'];
        //console.log(this.documentHTML);
      }, (err)=>{
        console.log('Error occured while fetching the document', err);
      })

  }


}
