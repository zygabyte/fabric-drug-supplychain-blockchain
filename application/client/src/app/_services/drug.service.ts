import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {Drug, DrugTransaction} from '../_models/drug';
import {AppConstants} from '../_constants/app-constants';
import {UserService} from './user.service';
import {User} from '../_models/user';
import {ErrorHandlers} from '../_utilities/handlers/error.handlers';
import {ApiModel} from '../_models/api.model';

@Injectable({
  providedIn: 'root'
})
export class DrugService {

  constructor(private httpClient: HttpClient, private userService: UserService) { }

  private createUserAuthorizationHeader(headers: HttpHeaders): HttpHeaders {
    let currentUser: User;

    // todo -> find a way to deal with this subscription
    this.userService.userSubject.subscribe((user: User) => {
      currentUser = user;
    });

    if (currentUser) { return headers.append('Authorization', 'Basic ' + btoa(currentUser.userid + ':' + currentUser.password)); }

    console.log('could not retrieve currently signed in user');
    return headers;
  }

  queryDrugs(): Observable<ApiModel<DrugTransaction[]>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .get<ApiModel<DrugTransaction[]>>(AppConstants.baseDrugUrl, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  queryDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .get<ApiModel<DrugTransaction>>(`${AppConstants.baseDrugUrl}/${drugId}`, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  queryDrugTransactionHistory(drugId: string): Observable<ApiModel<DrugTransaction[]>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .get<ApiModel<DrugTransaction[]>>(`${AppConstants.baseDrugUrl}/drug-history/${drugId}`, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  createDrug(drug: Drug): Observable<ApiModel<DrugTransaction>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .post<ApiModel<DrugTransaction>>(AppConstants.baseDrugUrl, drug, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  manufacturerShipDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<DrugTransaction>>(`${AppConstants.baseDrugUrl}/manufacturer/ship/${drugId}`, {}, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  distributorReceiveDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<DrugTransaction>>(`${AppConstants.baseDrugUrl}/distributor/receive/${drugId}`, {}, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  distributorShipDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<DrugTransaction>>(`${AppConstants.baseDrugUrl}/distributor/ship/${drugId}`, {}, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  wholesalerReceiveDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<DrugTransaction>>(`${AppConstants.baseDrugUrl}/wholesaler/receive/${drugId}`, {}, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  wholesalerShipDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<DrugTransaction>>(`${AppConstants.baseDrugUrl}/wholesaler/ship/${drugId}`, {}, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  retailerReceiveDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<DrugTransaction>>(`${AppConstants.baseDrugUrl}/retailer/receive/${drugId}`, {}, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }

  retailerSellDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<DrugTransaction>>(`${AppConstants.baseDrugUrl}/retailer/sell/${drugId}`, {}, {headers})
      .pipe(catchError(ErrorHandlers.handleApiError));
  }
}
