import { Injectable, Injector } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { retry } from 'rxjs/internal/operators/retry';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private storageService: StorageService,
    private router: Router,
    private injector: Injector,
    public utilityService: UtilityService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Fetch the token from the storage service
    let authToken = this.storageService.existData('authToken');

    if (authToken) {

      // Fetch current user details from the storage service
      let userData = (this.storageService.existData('userData') === null) ? {} : this.storageService.getLocalData('userData');

      // Join all the socket group rooms
      this.joinSocketRoom(userData);

      return true;

    } else {

      // If Document type has the readOnly mode to eb true
      if ((next.queryParamMap.get('readOnly') == 'true')
          || (state.url.includes('/flamingo') && state.url.includes('/answer'))) {
        return true;
      }

      // Else Redirect the traffic to home page
      else {
        //If route is to teams but user is not logged In
        // note:- Code is for teams auth popup not for octonius app and only work in that case.
        if(state.url.includes('/dashboard/user/teams') || state.url.includes('/dashboard/user/zap')){
          this.router.navigate(['/home'], { queryParams: { teams_permission_url:state.url } })
        }
        // else for any other route
        else {
          this.router.navigate(['/home'], { queryParams: { next, state } })
        }

        return false;
      }

    }


  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }


  /**
   * This function is responsible for joining a user to all the socket groups of which he is part
   */
  joinSocketRoom(userData: any) {
    userData._groups.forEach(groupId => {

      // Socket Service Instance
      let socketService = this.injector.get(SocketService);

      // Room Name Object
      let room = {
        workspace: userData.workspace_name,
        group: groupId
      }

      // Join the each group socket room
      this.emitJoinGroup(socketService, room)

    });
  }

  /**
   * This functions sends the update to other users about the updated workspace data
   * @param socketService
   * @param workspaceData
   */
  emitJoinGroup(socketService: SocketService, groupData: any) {
    return socketService.onEmit('joinGroup', groupData)
      .pipe(retry(Infinity))
      .subscribe()
  }
}
