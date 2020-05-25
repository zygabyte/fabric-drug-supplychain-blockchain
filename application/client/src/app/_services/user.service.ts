import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {ApiUser, User} from '../_models/user';
import {AppConstants, DefaultUser} from '../_constants/app-constants';
import {ErrorHandlers} from '../_utilities/handlers/error.handlers';
import {ApiModel} from '../_models/api.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // For testing without connecting to a blockchain network
  userSubject = new BehaviorSubject<User>(null); // starting with null.. to represent a non signed in user state
  private userCacheKey = 'currentUser';

  constructor(private httpClient: HttpClient) {}

  // __________________________________________blockchain util__________________________________________
  // This API is used to get all the users in the system
  getAllUsers(): Observable<ApiModel<ApiUser[]>> {
    let headers = new HttpHeaders();

    //  NOTE: an admin identity is needed to invoke this API since it calls the CA methods.
    headers = headers.append('Authorization', 'Basic ' + btoa(`${DefaultUser.userId}:${DefaultUser.userSecret}`));
    return this.httpClient.get<ApiModel<ApiUser[]>>(AppConstants.baseUserUrl, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  // This API is used during login to get the details of specific user trying to log in
  getUser(userId: string): Observable<ApiModel<ApiUser>> {
    let headers = new HttpHeaders();

    //  NOTE: an admin identity is needed to invoke this API since it calls the CA methods.
    headers = headers.append('Authorization', 'Basic ' + btoa(`${DefaultUser.userId}:${DefaultUser.userSecret}`));
    return this.httpClient.get<ApiModel<ApiUser>>(`${AppConstants.baseUserUrl}/${userId}`, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  // This API checks to see if user credentials exist in Wallet
  isUserEnrolled(userId: string): Observable<ApiModel<boolean>> {
    let headers = new HttpHeaders();

    headers = headers.append('Authorization', 'Basic ' + btoa(`${DefaultUser.userId}:${DefaultUser.userSecret}`));
    return this.httpClient.get<ApiModel<boolean>>(`${AppConstants.baseUserUrl}/is-enrolled/${userId}`, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }


  // __________________________________________local storage util__________________________________________

  setCurrentUser(user: User) {
    this.userSubject.next(user); // subscribers now have access to the newly authenticated user...

    localStorage.setItem(this.userCacheKey, JSON.stringify(user));
  }

  getCurrentUser() {
    const currentUser: User = JSON.parse(localStorage.getItem(this.userCacheKey));

    if (!currentUser) { return; }

    this.userSubject.next(currentUser); // subscribers now have access to the newly retrieved users from the local storage
  }

  removeCurrentUser()  {
    this.userSubject.next(null); // now no more signed in user... so reset state

    localStorage.removeItem(this.userCacheKey);
  }
}
