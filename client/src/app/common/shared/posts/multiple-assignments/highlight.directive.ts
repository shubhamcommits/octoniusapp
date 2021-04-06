import { Directive, Input, SimpleChanges, Renderer2, ElementRef, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective implements OnChanges {
  @Input() searchedWord: string;
  @Input() content: any;

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.content) {
      return;
    }

    if (!this.searchedWord || !this.searchedWord.length) {
      // const memberHTML = `<app-secured-image [src]="'${this.content.profile_pic}'" [style]="'width:30px !important;height:30px !important;'" [styleClass]="feed-avatar"></app-secured-image>`
      const memberHTML = `<img src="${this.baseUrl}/${this.content.profile_pic}?noAuth=true" onerror="this.src='assets/images/user.png'" style="width:30px !important;height:30px !important;" class="feed-avatar">`
        + this.content.first_name + ' ' + this.content.last_name + '  <span class="muted">' + this.content.email + '</span> ';
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', memberHTML);
      return;
    }


  }

  getFormattedText() {
    const re = new RegExp(`(${this.searchedWord})`, 'gi');
    return this.content.replace(re, `<span>$1</span>`);
  }
}
