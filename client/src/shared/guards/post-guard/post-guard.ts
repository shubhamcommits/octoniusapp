import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { map } from 'rxjs/operators';
import { positionElements } from '@ng-bootstrap/ng-bootstrap/util/positioning';
import { PostService } from 'src/shared/services/post-service/post.service';

@Injectable({
  providedIn: 'root',
})
export class PostGuard implements CanActivate  {
  constructor(
    private storageService: StorageService,
    private userService: UserService,
    private postService: PostService,
    private router: Router
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const postId = state.root.queryParamMap.get('postId');
    return this.checkUserPostAccess(postId);
  }

  checkUserPostAccess(postId): Observable<boolean> {
    return this.userService.getUser().pipe(map((userRes) => {
        this.postService.get(postId).then((postRes) =>{
            console.log(postRes);
        })
        return true;
    //   if (res.user._groups.includes(currentGroup) || res.user._private_group.includes(currentGroup)) {
    //       return true;
    //   } else {
    //       this.router.navigate(['dashboard', 'myspace', 'inbox']);
    //       return false;
    //   }
    }));
  }
}
