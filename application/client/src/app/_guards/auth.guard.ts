import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {UserService} from '../_services';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private userService: UserService) { }

    canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // what's going on here is that we avoid an active subscription here, because we just want to call this once (i.e. when i try hitting a particular route).. and not care about the changed value of user.. (so we don't need an explicit subscription).
    // so we just pipe to our observable and take the first value (which is the user, if logged in already.. or null)
    // then we map that retrieved user to determine if its not null - return true as that user is signed in
    // or return a url tree which angular interprets and routes to the specified url...
    return this.userService.userSubject.pipe(
      take(1),
      map(user => {
        if (user) { return true; }

        return this.router.createUrlTree(['/login']);
      })
    );
  }
}
