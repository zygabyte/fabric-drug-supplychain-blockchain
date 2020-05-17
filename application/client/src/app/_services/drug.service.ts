import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map, take} from 'rxjs/operators';

import {CreateDrug, Drug} from '../_models/drug';
import {Observable} from 'rxjs';
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

  createUserAuthorizationHeader(headers: HttpHeaders): HttpHeaders {
    let currentUser: User;

    // todo -> find a way to deal with this subscription
    this.userService.userSubject.subscribe((user: User) => {
      currentUser = user;
    });

    if (currentUser) { return headers.append('Authorization', 'Basic ' + btoa(currentUser.userid + ':' + currentUser.password)); }

    console.log('could not retrieve currently signed in user');
    return headers;
  }

  getAllDrugs(): Observable<ApiModel<Drug[]>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .get<ApiModel<string>>(AppConstants.baseDrugUrl, {headers})
      .pipe(map((apiModel: ApiModel<string>) => {
        const drugModel: ApiModel<Drug[]> = {
          data: JSON.parse(apiModel.data),
          code: apiModel.code,
          message: apiModel.message
        };

        return drugModel;
      }), catchError(ErrorHandlers.handleApiError));
  }

  getDrug(drugId: string): Observable<ApiModel<Drug>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .get<ApiModel<string>>(`${AppConstants.baseDrugUrl}/${drugId}`, {headers})
      .pipe(map((apiModel: ApiModel<string>) => {
        const drugModel: ApiModel<Drug> = {
          data: JSON.parse(apiModel.data),
          code: apiModel.code,
          message: apiModel.message
        };

        return drugModel;
      }), catchError(ErrorHandlers.handleApiError));
  }

  createDrug(drug: CreateDrug): Observable<ApiModel<Drug>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .post<ApiModel<string>>(AppConstants.baseDrugUrl, drug, {headers})
      .pipe(map((apiModel: ApiModel<string>) => {
        const drugModel: ApiModel<Drug> = {
          data: JSON.parse(apiModel.data),
          code: apiModel.code,
          message: apiModel.message
        };

        return drugModel;
      }), catchError(ErrorHandlers.handleApiError));
  }

  manufacturerShipDrug(drugId: string): Observable<ApiModel<Drug>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<string>>(`${AppConstants.baseDrugUrl}/manufacturer/ship/${drugId}`, {}, {headers})
      .pipe(map((apiModel: ApiModel<string>) => {
        const drugModel: ApiModel<Drug> = {
          data: JSON.parse(apiModel.data),
          code: apiModel.code,
          message: apiModel.message
        };

        return drugModel;
      }), catchError(ErrorHandlers.handleApiError));
  }

  distributorReceiveDrug(drugId: string): Observable<ApiModel<Drug>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<string>>(`${AppConstants.baseDrugUrl}/distributor/receive/${drugId}`, {}, {headers})
      .pipe(map((apiModel: ApiModel<string>) => {
        const drugModel: ApiModel<Drug> = {
          data: JSON.parse(apiModel.data),
          code: apiModel.code,
          message: apiModel.message
        };

        return drugModel;
      }), catchError(ErrorHandlers.handleApiError));
  }

  distributorShipDrug(drugId: string): Observable<ApiModel<Drug>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<string>>(`${AppConstants.baseDrugUrl}/distributor/ship/${drugId}`, {}, {headers})
      .pipe(map((apiModel: ApiModel<string>) => {
        const drugModel: ApiModel<Drug> = {
          data: JSON.parse(apiModel.data),
          code: apiModel.code,
          message: apiModel.message
        };

        return drugModel;
      }), catchError(ErrorHandlers.handleApiError));
  }

  wholesalerReceiveDrug(drugId: string): Observable<ApiModel<Drug>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<string>>(`${AppConstants.baseDrugUrl}/wholesaler/receive/${drugId}`, {}, {headers})
      .pipe(map((apiModel: ApiModel<string>) => {
        const drugModel: ApiModel<Drug> = {
          data: JSON.parse(apiModel.data),
          code: apiModel.code,
          message: apiModel.message
        };

        return drugModel;
      }), catchError(ErrorHandlers.handleApiError));
  }

  wholesalerShipDrug(drugId: string): Observable<ApiModel<Drug>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<string>>(`${AppConstants.baseDrugUrl}/wholesaler/ship/${drugId}`, {}, {headers})
      .pipe(map((apiModel: ApiModel<string>) => {
        const drugModel: ApiModel<Drug> = {
          data: JSON.parse(apiModel.data),
          code: apiModel.code,
          message: apiModel.message
        };

        return drugModel;
      }), catchError(ErrorHandlers.handleApiError));
  }

  retailerReceiveDrug(drugId: string): Observable<ApiModel<Drug>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<string>>(`${AppConstants.baseDrugUrl}/retailer/receive/${drugId}`, {}, {headers})
      .pipe(map((apiModel: ApiModel<string>) => {
        const drugModel: ApiModel<Drug> = {
          data: JSON.parse(apiModel.data),
          code: apiModel.code,
          message: apiModel.message
        };

        return drugModel;
      }), catchError(ErrorHandlers.handleApiError));
  }

  retailerSellDrug(drugId: string): Observable<ApiModel<Drug>> {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);

    return this.httpClient
      .patch<ApiModel<string>>(`${AppConstants.baseDrugUrl}/retailer/sell/${drugId}`, {}, {headers})
      .pipe(map((apiModel: ApiModel<string>) => {
        const drugModel: ApiModel<Drug> = {
          data: JSON.parse(apiModel.data),
          code: apiModel.code,
          message: apiModel.message
        };

        return drugModel;
      }), catchError(ErrorHandlers.handleApiError));
  }
}
