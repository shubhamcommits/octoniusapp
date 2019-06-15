import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class ProfileDataService {

  user = new BehaviorSubject({});

  constructor() { }
}
