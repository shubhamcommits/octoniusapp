import { Injectable } from '@angular/core';
import * as Quill from 'quill';
import QuillAutoLink from '../models/quill-auto-link.model';

@Injectable()
export class QuillAutoLinkService {

  constructor() { 
    var Link = Quill.import('formats/link');
    Link.sanitize = (url) => {
      if(url.indexOf("http") <= -1){
        url = "https://" + url;
      }
      return url;
    }
    Quill.register('modules/autoLink', QuillAutoLink);
  }
}
