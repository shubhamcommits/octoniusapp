import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { LibreofficeService } from 'src/shared/services/libreoffice-service/libreoffice.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-office-editor',
  templateUrl: './office-editor.component.html',
  styleUrls: ['./office-editor.component.css']
})
export class OfficeEditorComponent implements OnInit {

  @ViewChild('officeSubmitForm', { static: true }) officeSubmitForm!: ElementRef;
  @ViewChild('officeFrameholder', { static: true }) officeFrameholder: ElementRef;

  accessToken = '';

  wopiClientURL = '';

  userData: any;
  authToken: string = '';

  fileId = this._activatedRoute.snapshot.paramMap.get("id");

  fileData: any;
  readOnly: boolean = false;

  // Public Function Object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    public sanitizer: DomSanitizer,
    private utilityService: UtilityService,
    private libreofficeService: LibreofficeService,
    private storageService: StorageService,
    private _activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {
    // this.userData = await this.publicFunctions.getCurrentUser();
    this.authToken = `Bearer%20${this.storageService.getLocalData('authToken')['token']}`;

    this.fileId = this._activatedRoute.snapshot.paramMap.get("id");

    this.fileData = await this.publicFunctions.getFile(this.fileId);

    this.getWopiClientUrl();
  }

  getWopiClientUrl() {
    // this.wopiClientURL = https://<WOPI client URL>:<port>/browser/<hash>/cool.html?WOPISrc=https://<WOPI host URL>/<...>/wopi/files/<id>
    let wopiSrc =  `${environment.UTILITIES_BASE_API_URL}/libreofficeService/wopi/files/${this.fileId}?authToken=${this.authToken}`;
    this.libreofficeService.getLibreofficeUrl().then(res => {

      if (!environment.production) {
        const urlSplit = res['url'].split('http://localhost/');
        this.wopiClientURL = environment.LIBREOFFICE_BASE_URL + urlSplit[1];
      } else {
        this.wopiClientURL = res['url'];
      }
      this.wopiClientURL += 'WOPISrc=' + wopiSrc;
console.log(wopiSrc);
console.log(this.wopiClientURL);
      this.accessToken = this.authToken;
      this.officeSubmitForm.nativeElement.submit();
    }).catch(error => {
      this.utilityService.errorNotification('Not possible to retrieve the complete Office Online url');
    });
  }

  async loadDocument() {
    const existingOfficeframe = document.getElementById('officeFrame');

    if (existingOfficeframe) {
      existingOfficeframe.parentNode.removeChild(existingOfficeframe);
    }

    await this.getWopiClientUrl();

    const officeFrame = document.createElement('iframe');
    officeFrame.name = 'officeFrame';
    officeFrame.id = 'officeFrame';
    officeFrame.title = 'Office Online Frame';
    officeFrame.setAttribute('allowfullscreen', 'true');
    officeFrame.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox'
    );
    this.officeFrameholder.nativeElement.appendChild(officeFrame);
    this.accessToken = this.storageService.getLocalData('authToken')['token'];
    this.officeSubmitForm.nativeElement.action = this.wopiClientURL;
    this.officeSubmitForm.nativeElement.submit();
  }
}
