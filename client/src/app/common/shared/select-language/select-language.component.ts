import { Component, OnInit, Input, LOCALE_ID, Inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-select-language',
  templateUrl: './select-language.component.html',
  styleUrls: ['./select-language.component.scss']
})
export class SelectLanguageComponent implements OnInit {

  // User Data Input from component
  @Input('userData') userData: any;

  languages: any = [];

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_BASE_URL;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private userService: UserService,
    private injector: Injector,
    private _router: Router
    ) { }

  async ngOnInit() {
    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    this.initLanguages();
  }

  initLanguages() {
    this.languages.push({ name: $localize`:@@selectLanguage.german:German`, code: 'de'});
    this.languages.push({ name: $localize`:@@selectLanguage.english:English`, code: 'en'});
    this.languages.push({ name: $localize`:@@selectLanguage.spanish:Spanish`, code: 'es'});
  }

  selectLanguage(languageCode: any) {
    this.userService.saveLocale(languageCode).then(res => {

      this.userData = res['user'];
      this.publicFunctions.sendUpdatesToUserData(this.userData);

      localStorage.setItem('locale', languageCode);

      let redirect_uri = environment.clientUrl;
      if (environment.production) {
        redirect_uri += '/' + languageCode;
      }

      redirect_uri += this._router.url;

      if (this.locale != languageCode) {
        window.location.href = redirect_uri;
      }
    });
  }

}
