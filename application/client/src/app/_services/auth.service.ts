import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';

import { ApiService } from './api.service';
import { UserService } from './user.service';
import {User} from '../_models/user';
import {ApiModel} from '../_models/api.model';
import {ErrorHandlers} from '../_utilities/handlers/error.handlers';
import {AppConstants, DefaultUser} from '../_constants/app-constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient, private api: ApiService, private userService: UserService, private router: Router) {}

  registerUser(user: User): Observable<ApiModel<string>> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa(`${DefaultUser.userId}:${DefaultUser.userSecret}`));
    return this.httpClient
      .post<ApiModel<string>>(`${AppConstants.baseUserUrl}/register`, user, {headers})
      .pipe(catchError(ErrorHandlers.handleAuthError));
  }


  // todo -> make sure to update this on the backend to use the passed user for the enrollment
  enrollUser(user: User): Observable<ApiModel<string>> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa(`${DefaultUser.userId}:${DefaultUser.userSecret}`));
    return this.httpClient
      .post<ApiModel<string>>(`${AppConstants.baseUserUrl}/enroll`, user, {headers})
      .pipe(catchError(ErrorHandlers.handleAuthError));
  }

  logout() {
    this.api.clearOrders();
    this.userService.removeCurrentUser();
  }
}







// export class AuthService {
//   // Use if testing without connecting to a blockchain service
//   // users: User[];
//
//   constructor(private httpClient: HttpClient, private api: ApiService, private userService: UserService, private router: Router) {
//     // get all users in fake database. Use if testing without connecting to a blockchain service
//     // this.users = userService.getAll();
//   }
//
//   baseUrl = "http://localhost:3000";
//
//
//   register(user){
//     let headers = new HttpHeaders();
//     headers = headers.append('Authorization', 'Basic ' + btoa('admin:adminpw'));
//     return this.httpClient.post(this.baseUrl + '/api/register-user', user, {headers:headers,responseType:'text'});
//   }
//
//   enroll(user){
//     let headers = new HttpHeaders();
//     headers = headers.append('Authorization', 'Basic ' + btoa(user.userid+':'+user.password));
//     return this.httpClient.post(this.baseUrl + '/api/enroll-user', {usertype:user.usertype}, {headers:headers,responseType:'text'});
//   }
//
//   logout() {
//     this.api.clearOrders();
//     // remove user from local storage to log user out
//     this.userService.clearCurrentUser();
//     localStorage.removeItem('currentUser');
//     this.router.navigate(['/login']);
//   }
//
// }
