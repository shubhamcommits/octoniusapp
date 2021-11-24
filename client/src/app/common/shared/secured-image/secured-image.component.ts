import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-secured-image',
  templateUrl: './secured-image.component.html',
  styleUrls: ['./secured-image.component.scss']
})
export class SecuredImageComponent implements OnChanges  {
  // This code block just creates an rxjs stream from the src
  // this makes sure that we can handle source changes
  // or even when the component gets destroyed
  // So basically turn src into src$
  @Input() imgURL: string = ''; // url of the file
  @Input() tooltip: string = ''; // tooltip
  @Input() service: string = 'user'; // service where the file is part of ['workspace', 'group', 'user']
  @Input() placement: string = 'right'; // placement
  @Input() styleClass: string = ''; // css class used
  @Input() alt: string = ''; // alternative text
  @Input() inlineStyle: string = ''; // inline styles
  @Input() noAuth: boolean = false; // in case we need a work around for security (only valid for selecting workplace because the user is not logged in yet)

  onErrorUrl: string = '';

  private src$ = new BehaviorSubject<string>(this.imgURL);

  // this stream will contain the actual url that our img tag will load
  // everytime the src changes, the previous call would be canceled and the
  // new resource would be loaded

  dataUrl$;

  isLocalImg: boolean = false;

  constructor(
    private httpClient: HttpClient,
    private domSanitizer: DomSanitizer) {
  }

  ngOnChanges(): void {

    this.isLocalImg = this.imgURL && this.imgURL.indexOf('assets/images') != -1;

    switch (this.service) {
      case 'workspace':
        if(!this.imgURL || this.imgURL == 'undefined' || this.isLocalImg) {
          this.imgURL = "assets/images/organization.png";
          this.isLocalImg = true;
        }

        if (!this.isLocalImg && this.imgURL.indexOf(environment.UTILITIES_WORKSPACES_UPLOADS) == -1) {
          this.src$.next(environment.UTILITIES_WORKSPACES_UPLOADS + '/' + this.imgURL);
        } else {
          this.src$.next(this.imgURL);
        }
        this.dataUrl$ = this.src$.pipe(switchMap(url => this.loadImage(url)));
        this.onErrorUrl = "assets/images/organization.png";
        break;
      case 'group':
        if(!this.imgURL || this.imgURL == 'undefined' || this.isLocalImg) {
          this.imgURL = "assets/images/icon-new-group.svg";
          this.isLocalImg = true;
        }

        if (!this.isLocalImg && this.imgURL.indexOf(environment.UTILITIES_GROUPS_UPLOADS) == -1) {
          this.src$.next(environment.UTILITIES_GROUPS_UPLOADS + '/' + this.imgURL);
        } else {
          this.src$.next(this.imgURL);
        }
        this.dataUrl$ = this.src$.pipe(switchMap(url => this.loadImage(url)));
        this.onErrorUrl = "assets/images/icon-new-group.svg";
        break;
      case 'user':
        if(!this.imgURL || this.imgURL == 'undefined' || this.isLocalImg) {
          this.imgURL = "assets/images/user.png";
          this.isLocalImg = true;
        }

        if (!this.isLocalImg && this.imgURL.indexOf(environment.UTILITIES_USERS_UPLOADS) == -1) {
          this.src$.next(environment.UTILITIES_USERS_UPLOADS + '/' + this.imgURL);
        } else {
          this.src$.next(this.imgURL);
        }
        this.dataUrl$ = this.src$.pipe(switchMap(url => this.loadImage(url)));
        this.onErrorUrl = "assets/images/user.png";
        break;
      case 'flamingo':
          if(!this.imgURL || this.imgURL == 'undefined' || this.isLocalImg) {
            this.imgURL = "http://placehold.it/180";
            this.isLocalImg = true;
          }

          if (!this.isLocalImg && this.imgURL.indexOf(environment.UTILITIES_FLAMINGOS_UPLOADS) == -1) {
            this.src$.next(environment.UTILITIES_FLAMINGOS_UPLOADS + '/' + this.imgURL);
          } else {
            this.src$.next(this.imgURL);
          }
          this.dataUrl$ = this.src$.pipe(switchMap(url => this.loadImage(url)));
          this.onErrorUrl = "http://placehold.it/180";
          break;
      default:
        break;
    }
  }

  private loadImage(url: string): Observable<any> {
    if (this.noAuth) {
      let params = new HttpParams().set('noAuth', this.noAuth.toString());
      return this.httpClient
        // load the image as a blob
        .get(url, { responseType: 'blob', params: params })
        // create an object url of that blob that we can use in the src attribute
        .pipe(map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))));
    } else {
      return this.httpClient
        // load the image as a blob

        .get(url, { responseType: 'blob' })
        // create an object url of that blob that we can use in the src attribute
        .pipe(map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))));
    }
  }
}
