import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';

@Injectable({
  providedIn: 'root',
})
export class StoryGuard implements CanActivate  {

  constructor(
    private loungeService: LoungeService
  ) {

  }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {

    // Obtain the storyId
    const currentStoryId = state.root.queryParamMap.get('story');

    // Add the user as reader
    this.loungeService.addReader(currentStoryId);

    return true;
  }
}
