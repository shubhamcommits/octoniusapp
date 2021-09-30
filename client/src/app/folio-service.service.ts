import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FolioServiceService {
  follioSubject = new Subject<String>();

  setNewFollioValue(data: String) {
    this.follioSubject.next(data)
  }

  constructor() { }
}
