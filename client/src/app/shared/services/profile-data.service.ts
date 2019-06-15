import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable()
export class ProfileDataService {

  user = new BehaviorSubject({});

  constructor() { }
}
