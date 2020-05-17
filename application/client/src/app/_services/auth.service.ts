import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

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

  // registerUser(user: User): Observable<ApiModel<string>> {
  //   let headers = new HttpHeaders();
  //   headers = headers.append('Authorization', 'Basic ' + btoa(`${DefaultUser.userId}:${DefaultUser.userSecret}`));
  //   return this.httpClient
  //     // .post<ApiModel<string>>(`${AppConstants.baseUserUrl}/register`, user, {headers})
  //     .post<ApiModel<string>>(`${AppConstants.baseUrl}/api/register-user`, user, {headers})
  //     .pipe(map((apiModel: ApiModel<string>) => {
  //       const registeredUser: ApiModel<string> = {
  //         data: apiModel.data,
  //         code: apiModel.code,
  //         message: apiModel.message
  //       };
  //
  //       return registeredUser;
  //     }), catchError(ErrorHandlers.handleApiError));
  // }
  registerUser(user: User): Observable<ApiModel<string>> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa(`${DefaultUser.userId}:${DefaultUser.userSecret}`));
    return this.httpClient
      // .post<ApiModel<string>>(`${AppConstants.baseUserUrl}/register`, user, {headers})
      .post<ApiModel<string>>(`${AppConstants.baseUrl}/api/register-user`, user, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }


  // todo -> make sure to update this on the backend to use the passed user for the enrollment
  enrollUser(user: User): Observable<ApiModel<string>> {
    let headers = new HttpHeaders();
    // headers = headers.append('Authorization', 'Basic ' + btoa(`${DefaultUser.userId}:${DefaultUser.userSecret}`));
    headers = headers.append('Authorization', 'Basic ' + btoa(`${user.userid}:${user.password}`));
    return this.httpClient
      // .post<ApiModel<string>>(`${AppConstants.baseUserUrl}/enroll`, user, {headers})
      .post<ApiModel<string>>(`${AppConstants.baseUrl}/api/enroll-user`, user, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  logout() {
    this.api.clearOrders();
    this.userService.removeCurrentUser();
  }
}
