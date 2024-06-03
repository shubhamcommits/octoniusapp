import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnChanges, Input, Injector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent implements OnChanges {

  @Input() public photoUrl: string = '';
  @Input() public userData;
  @Input() public styleClass: string;

  @Input() tooltip: string = ''; // tooltip
  @Input() placement: string = 'right'; // placement
  @Input() alt: string = ''; // alternative text
  @Input() inlineStyle: string = ''; // inline styles
  @Input() noAuth: boolean = false; // in case we need a work around for security (only valid for selecting workplace because the user is not logged in yet)

  workspaceData;

  backgroundColor;

  onErrorUrl: string = '';

  private src$ = new BehaviorSubject<string>(this.photoUrl);

  // this stream will contain the actual url that our img tag will load
  // everytime the src changes, the previous call would be canceled and the
  // new resource would be loaded

  dataUrl$;

  isLocalImg: boolean = false;
  isLoading: boolean;

  public showInitials = false;
  public initials: string;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private httpClient: HttpClient,
    private domSanitizer: DomSanitizer) {
  }

  async ngOnChanges() {

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.isLocalImg = !!this.photoUrl && this.photoUrl.indexOf('assets/images') != -1;

    if(!this.photoUrl || this.photoUrl == 'undefined' || this.isLocalImg) {
      this.photoUrl = "assets/images/user.png";
      this.isLocalImg = true;
    }

    if (!this.isLocalImg && this.photoUrl.indexOf(environment.UTILITIES_USERS_UPLOADS) == -1) {
      this.src$.next(environment.UTILITIES_USERS_UPLOADS + '/' + this.workspaceData._id + '/' + this.photoUrl);
      this.showInitials = false;
    } else if (!!this.userData) {
      this.showInitials = true;
      this.createInititals();
    } else {
      this.src$.next(this.photoUrl);
      this.showInitials = false;
    }

    this.onErrorUrl = "assets/images/user.png";

    this.dataUrl$ = this.src$.pipe(switchMap(url => this.loadImage(url)));
  }

  private loadImage(url: string): Observable<any> {
    try {
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
    } catch (err) {
      // this.publicFunctions.sendError(err);
      console.log(err);
      this.photoUrl = "assets/images/user.png";
      this.isLocalImg = true;
      this.src$.next(this.photoUrl);
      return this.dataUrl$ = null;
    }
  }

  private createInititals(): void {
    let initials = "";
    const name = this.userData.first_name + ' ' + this.userData.last_name;
    for (let i = 0; i < name.length; i++) {
      if (name.charAt(i) === ' ') {
        continue;
      }

      if (name.charAt(i) === name.charAt(i).toUpperCase()) {
        initials += name.charAt(i);

        if (initials.length == 2) {
          break;
        }
      }
    }

    // this.backgroundColor = this.backgroundColors[Math.floor(Math.random() * this.backgroundColors.length)];
    this.generateBGColor(name);

    this.initials = initials;
  }

  generateBGColor(name: string) {
    const hRange = [0, 360];
    const sRange = [0, 100];
    const lRange = [0, 100];

    const hash = this.getHashOfString(name);
    const h = this.normalizeHash(hash, hRange[0], hRange[1]);
    const s = this.normalizeHash(hash, sRange[0], sRange[1]);
    const l = this.normalizeHash(hash, lRange[0], lRange[1]);

    this.backgroundColor = this.hslToHex(h, s, l);
  }

  getHashOfString(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return hash;
  }

  normalizeHash(hash: number, min: number, max: number) {
    return Math.floor((hash % (max - min)) + min);
  }

  hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  hideLoader() {
    this.isLoading = false;
  }
}
