import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiModel} from '../../_models/api.model';
import {Drug} from '../../_models/drug';
import {DrugState, DrugStateUtil, StatusCodes} from '../../_constants/app-constants';

@Injectable({
  providedIn: 'root'
})
export class MockDrugService {

  private mockDrugs: Drug[] = [
    {
      drugId: 'panadolc509df899acb5a8e3937',
      drugName: 'Panadol',
      price: 1900,
      quantity: 56,
      expiryDate: new Date(2022, 11, 21).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      prescription: '1 in the morning, afternoon and night',
      currentState: DrugState.DRUG_SOLD,
      manufacturerId: 'ade_producer',
      distributorId: 'joe_distributor',
      wholesalerId: 'jane_wholesaler',
      retailerId: 'james_retailer',
      created: new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      manufacturerShipped: new Date(2020, 6, 4).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      distributorReceived: new Date(2020, 6, 7).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      distributorShipped: new Date(2020, 6, 8).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      wholesalerReceived: new Date(2020, 6, 11).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      wholesalerShipped: new Date(2020, 6, 17).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      retailerReceived: new Date(2020, 6, 19).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      sold: new Date(2020, 6, 24).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      currentOwner: 'james_retailer',
      status: DrugStateUtil.getDrugStateName(DrugState.DRUG_SOLD)
    },
    {
      drugId: 'chloroquine72a7899c5f560b81cb6d',
      drugName: 'Chloroquine',
      price: 1300,
      quantity: 56,
      expiryDate: new Date(2024, 2, 9).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      prescription: '1 in the morning, afternoon and night',
      currentState: DrugState.RETAILER_RECEIVED,
      manufacturerId: 'ade_producer',
      distributorId: 'joe_distributor',
      wholesalerId: 'jane_wholesaler',
      retailerId: 'james_retailer',
      created: new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      manufacturerShipped: new Date(2020, 7, 3).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      distributorReceived: new Date(2020, 7, 9).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      distributorShipped: new Date(2020, 7, 8).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      wholesalerReceived: new Date(2020, 7, 13).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      wholesalerShipped: new Date(2020, 7, 17).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      retailerReceived: new Date(2020, 7, 19).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      sold: new Date(2020, 7, 26).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      currentOwner: 'james_retailer',
      status: DrugStateUtil.getDrugStateName(DrugState.RETAILER_RECEIVED)
    },
    {
      drugId: 'amoxicillin85355d31800ba1524da5',
      drugName: 'Amoxicillin',
      price: 1100,
      quantity: 21,
      expiryDate: new Date(2023, 9, 24).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      prescription: '1 in the morning, afternoon and night',
      currentState: DrugState.DRUG_CREATED,
      manufacturerId: 'ade_producer',
      distributorId: 'joe_distributor',
      wholesalerId: 'jane_wholesaler',
      retailerId: 'james_retailer',
      created: new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      manufacturerShipped: new Date(2020, 9, 9).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      distributorReceived: new Date(2020, 9, 9).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      distributorShipped: new Date(2020, 9, 11).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      wholesalerReceived: new Date(2020, 9, 15).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      wholesalerShipped: new Date(2020, 9, 16).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      retailerReceived: new Date(2020, 9, 18).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      sold: new Date(2020, 9, 21).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      currentOwner: 'james_retailer',
      status: DrugStateUtil.getDrugStateName(DrugState.DRUG_CREATED)
    }
  ];

  constructor() { }

  getAllMockDrugs(): Observable<ApiModel<string>> {
    const mockDrugsModel: ApiModel<string> = {
      code: StatusCodes.success,
      message: 'successfully retrieved drugs',
      data: JSON.stringify(this.mockDrugs)
    };

    return new Observable((data) => {
      data.next(mockDrugsModel);
    });
  }
}
