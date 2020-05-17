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

  private createUserAuthorizationHeader(headers: HttpHeaders): HttpHeaders {
    let currentUser: User;

    // todo -> find a way to deal with this subscription
    this.userSubject.subscribe((user: User) => {
      currentUser = user;
    });

    if (currentUser) { return headers.append('Authorization', 'Basic ' + btoa(currentUser.userid + ':' + currentUser.password)); }

    console.log('could not retrieve currently signed in user');
    return headers;
  }

  // __________________________________________blockchain util__________________________________________

  getAllUsers(): Observable<ApiUser[]> {
    let headers = new HttpHeaders();
    //
    //  NOTE: an admin identity is needed to invoke this API since it calls the CA methods.
    headers = headers.append('Authorization', 'Basic ' + btoa(`${DefaultUser.userId}:${DefaultUser.userSecret}`));
    // replace with this line to pass in the current user vs admin
    // headers = this.createUserAuthorizationHeader(headers);
    return this.httpClient.get<ApiUser[]>(AppConstants.baseUserUrl, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  // use after updating ledger
  // getAllUsers(): Observable<ApiModel<ApiUser[]>> {
  //   let headers = new HttpHeaders();
  //   //
  //   //  NOTE: an admin identity is needed to invoke this API since it calls the CA methods.
  //   headers = headers.append('Authorization', 'Basic ' + btoa(`${DefaultUser.userId}:${DefaultUser.userSecret}`));
  //   // replace with this line to pass in the current user vs admin
  //   // headers = this.createUserAuthorizationHeader(headers);
  //   return this.httpClient.get<ApiModel<ApiUser[]>>(AppConstants.baseUserUrl, {headers})
  //     .pipe(catchError(ErrorHandlers.handleApiError));
  // }

  // This API is used during login to get the details of specific user trying to log in
  // The 'usertype' is retrieved to set the currentUser for this application
  // getUser(userId: string): Observable<ApiModel<ApiUser>> {
  getUser(userId: string): Observable<ApiUser> {
    let headers = new HttpHeaders();
    //
    //  NOTE: an admin identity is needed to invoke this API since it calls the CA methods.
    headers = headers.append('Authorization', 'Basic ' + btoa('admin:adminpw'));
    // replace with this line to pass in the user trying to log in vs admin
    // headers = headers.append('Authorization', 'Basic ' + btoa(this.id+':'+this.pwd));
    // return this.httpClient.get<ApiModel<ApiUser>>(`${AppConstants.baseUserUrl}/${userId}`, {headers})
    //   .pipe(catchError(ErrorHandlers.handleApiError));
    return this.httpClient.get<ApiUser>(`${AppConstants.baseUserUrl}/${userId}`, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  // use after updating ledger
  // getUser(userId: string): Observable<ApiModel<ApiUser>> {
  //   let headers = new HttpHeaders();
  //   //
  //   //  NOTE: an admin identity is needed to invoke this API since it calls the CA methods.
  //   headers = headers.append('Authorization', 'Basic ' + btoa('admin:adminpw'));
  //   // replace with this line to pass in the user trying to log in vs admin
  //   // headers = headers.append('Authorization', 'Basic ' + btoa(this.id+':'+this.pwd));
  //   return this.httpClient.get<ApiModel<ApiUser>>(`${AppConstants.baseUserUrl}/${userId}`, {headers})
  //     .pipe(catchError(ErrorHandlers.handleApiError));
  // }


  // This API checks to see if user credentials exist in Wallet
  isUserEnrolled(userId: string): Observable<boolean> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);
    // return this.httpClient.get(`${AppConstants.baseUserUrl}/is-enrolled/${userId}`, {headers});
    return this.httpClient.get<boolean>(`${AppConstants.baseUrl}/api/is-user-enrolled/${userId}`, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  // use after updating ledger
  // isUserEnrolled(userId: string): Observable<ApiModel<boolean>> {
  //   let headers = new HttpHeaders();
  //   headers = this.createUserAuthorizationHeader(headers);
  //   // return this.httpClient.get(`${AppConstants.baseUserUrl}/is-enrolled/${userId}`, {headers});
  //   return this.httpClient.get<ApiModel<boolean>>(`${AppConstants.baseUrl}/api/is-user-enrolled/${userId}`, {headers})
  //     .pipe(catchError(ErrorHandlers.handleApiError));
  // }


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
