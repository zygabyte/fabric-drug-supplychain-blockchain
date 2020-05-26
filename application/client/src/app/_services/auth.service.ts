import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';

import { UserService } from './user.service';
import {User} from '../_models/user';
import {ApiModel} from '../_models/api.model';
import {ErrorHandlers} from '../_utilities/handlers/error.handlers';
import {AppConstants, DefaultUser} from '../_constants/app-constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient, private userService: UserService) {}

  registerUser(user: User): Observable<ApiModel<string>> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa(`${DefaultUser.userId}:${DefaultUser.userSecret}`));
    return this.httpClient
      .post<ApiModel<string>>(`${AppConstants.baseUserUrl}/register`, user, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  enrollUser(user: User): Observable<ApiModel<string>> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa(`${DefaultUser.userId}:${DefaultUser.userSecret}`));
    return this.httpClient
      .post<ApiModel<string>>(`${AppConstants.baseUserUrl}/enroll`, user, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  logout() {
    this.userService.removeCurrentUser();
  }
}
