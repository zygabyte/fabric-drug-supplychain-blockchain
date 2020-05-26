import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';

import {ApiModel} from '../../_models/api.model';
import {Drug, DrugStateUtil, DrugTransaction} from '../../_models/drug';
import {DrugState, ApiStatusCodes} from '../../_constants/app-constants';
import {User} from '../../_models/user';
import {UserService} from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class MockDrugService implements OnDestroy {

  currentUser: User;
  userSubscription: Subscription;

  mockDrugsSubject = new BehaviorSubject<ApiModel<DrugTransaction[]>>(null);

  private mockDrugs: DrugTransaction[] = [
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
      timeStamp: new Date(2020, 7, 9).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      currentOwner: 'james_retailer',
      isDeleted: false,
      transactionId: '',
      currentStateName: DrugStateUtil.getDrugStateName(DrugState.DRUG_SOLD)
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
      timeStamp: new Date(2020, 6, 11).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      currentOwner: 'james_retailer',
      isDeleted: false,
      transactionId: '',
      currentStateName: DrugStateUtil.getDrugStateName(DrugState.RETAILER_RECEIVED)
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
      timeStamp: new Date(2020, 11, 11).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      currentOwner: 'ade_producer',
      isDeleted: false,
      transactionId: '',
      currentStateName: DrugStateUtil.getDrugStateName(DrugState.DRUG_CREATED)
    }
  ];

  constructor(private userService: UserService) {
    this.userSubscription = this.userService.userSubject.subscribe((user: User) => {
      this.currentUser = user;
    });
  }

  getAllDrugs(): Observable<ApiModel<DrugTransaction[]>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    const mockDrugsModel: ApiModel<DrugTransaction[]> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    return this.mockDrugsSubject.asObservable();
  }


  getDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    const mockDrugModel: ApiModel<DrugTransaction> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'successfully retrieved drug',
      data: this.mockDrugs.find(mockDrug => mockDrug.drugId === drugId)
    };

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  createDrug(drug: Drug): Observable<ApiModel<DrugTransaction>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    const newDrug: DrugTransaction = {
      drugId: drug.drugId,
      drugName: drug.drugName,
      price: drug.price,
      quantity: drug.quantity,
      expiryDate: drug.expiryDate,
      prescription: drug.prescription,
      currentState: DrugState.DRUG_CREATED,
      manufacturerId: this.currentUser.userid,
      distributorId: '',
      wholesalerId: '',
      retailerId: '',
      created: new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      timeStamp: new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}),
      currentOwner: 'ade_producer',
      isDeleted: false,
      transactionId: '',
      currentStateName: DrugStateUtil.getDrugStateName(DrugState.DRUG_CREATED)
    };

    this.mockDrugs.push(newDrug);

    const mockDrugModel: ApiModel<DrugTransaction> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'successfully created drug',
      data: newDrug
    };

    const mockDrugsModel: ApiModel<DrugTransaction[]> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  manufacturerShipDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: DrugTransaction;

    this.mockDrugs.find((mock, index) => {
      if (mock.drugId === drugId) {
        const mockDrug = JSON.parse(JSON.stringify(this.mockDrugs.slice(index, index + 1)[0]));
        mockDrug.currentState = DrugState.MANUFACTURER_SHIPPED;
        mockDrug.currentStateName = DrugStateUtil.getDrugStateName(DrugState.MANUFACTURER_SHIPPED);
        mockDrug.timeStamp = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        this.mockDrugs.push(mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<DrugTransaction> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'manufacturer successfully shipped drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<DrugTransaction[]> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  distributorReceiveDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: DrugTransaction;

    this.mockDrugs.find((mock, index) => {
      if (mock.drugId === drugId) {
        const mockDrug = JSON.parse(JSON.stringify(this.mockDrugs.slice(index, index + 1)[0]));
        mockDrug.currentState = DrugState.DISTRIBUTOR_RECEIVED;
        mockDrug.currentStateName = DrugStateUtil.getDrugStateName(DrugState.DISTRIBUTOR_RECEIVED);
        mockDrug.timeStamp = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        mockDrug.distributorId = this.currentUser.userid;
        this.mockDrugs.push(mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<DrugTransaction> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'distributor successfully received drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<DrugTransaction[]> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  distributorShipDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: DrugTransaction;

    this.mockDrugs.find((mock, index) => {
      if (mock.drugId === drugId) {
        const mockDrug = JSON.parse(JSON.stringify(this.mockDrugs.slice(index, index + 1)[0]));
        mockDrug.currentState = DrugState.DISTRIBUTOR_SHIPPED;
        mockDrug.currentStateName = DrugStateUtil.getDrugStateName(DrugState.DISTRIBUTOR_SHIPPED);
        mockDrug.timeStamp = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        this.mockDrugs.push(mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<DrugTransaction> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'distributor successfully shipped drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<DrugTransaction[]> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  wholesalerReceiveDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: DrugTransaction;

    this.mockDrugs.find((mock, index) => {
      if (mock.drugId === drugId) {
        const mockDrug = JSON.parse(JSON.stringify(this.mockDrugs.slice(index, index + 1)[0]));
        mockDrug.currentState = DrugState.WHOLESALER_RECEIVED;
        mockDrug.currentStateName = DrugStateUtil.getDrugStateName(DrugState.WHOLESALER_RECEIVED);
        mockDrug.timeStamp = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        mockDrug.wholesalerId = this.currentUser.userid;
        this.mockDrugs.push(mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<DrugTransaction> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'wholesaler successfully received drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<DrugTransaction[]> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  wholesalerShipDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: DrugTransaction;

    this.mockDrugs.find((mock, index) => {
      if (mock.drugId === drugId) {
        const mockDrug = JSON.parse(JSON.stringify(this.mockDrugs.slice(index, index + 1)[0]));
        mockDrug.currentState = DrugState.WHOLESALER_SHIPPED;
        mockDrug.currentStateName = DrugStateUtil.getDrugStateName(DrugState.WHOLESALER_SHIPPED);
        mockDrug.timeStamp = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        this.mockDrugs.push(mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<DrugTransaction> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'wholesaler successfully shipped drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<DrugTransaction[]> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  retailerReceiveDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: DrugTransaction;

    this.mockDrugs.find((mock, index) => {
      if (mock.drugId === drugId) {
        const mockDrug = JSON.parse(JSON.stringify(this.mockDrugs.slice(index, index + 1)[0]));
        mockDrug.currentState = DrugState.RETAILER_RECEIVED;
        mockDrug.currentStateName = DrugStateUtil.getDrugStateName(DrugState.RETAILER_RECEIVED);
        mockDrug.timeStamp = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        mockDrug.retailerId = this.currentUser.userid;
        this.mockDrugs.push(mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<DrugTransaction> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'retailer successfully received drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<DrugTransaction[]> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  retailerSellDrug(drugId: string): Observable<ApiModel<DrugTransaction>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: DrugTransaction;

    this.mockDrugs.find((mock, index) => {
      if (mock.drugId === drugId) {
        const mockDrug = JSON.parse(JSON.stringify(this.mockDrugs.slice(index, index + 1)[0]));
        mockDrug.currentState = DrugState.DRUG_SOLD;
        mockDrug.currentStateName = DrugStateUtil.getDrugStateName(DrugState.DRUG_SOLD);
        mockDrug.timeStamp = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        this.mockDrugs.push(mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<DrugTransaction> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'retailer successfully sold drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<DrugTransaction[]> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  getDrugTransactionHistory(drugId: string): Observable<ApiModel<DrugTransaction[]>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    const drugTransactionHistory: DrugTransaction[] = [];

    this.mockDrugs.forEach(drugTransaction => {
      if (drugTransaction.drugId === drugId) drugTransactionHistory.push(drugTransaction);
    });

    const mockDrugsModel: ApiModel<DrugTransaction[]> = {
      code: ApiStatusCodes.SUCCESS,
      message: 'successfully retrieved drugs',
      data: drugTransactionHistory
    };

    return new Observable((data) => {
      data.next(mockDrugsModel);
    });
  }

  private storeDrugsInLocalStorage() {
    localStorage.setItem('mockDrugs', JSON.stringify(this.mockDrugs));
  }

  private getDrugsFromLocalStorage(): DrugTransaction[] {
    const storedDrugs = localStorage.getItem('mockDrugs');

    if (storedDrugs) return JSON.parse(storedDrugs);

    this.storeDrugsInLocalStorage(); // reset drugs in local store... usually for first time call

    return JSON.parse(localStorage.getItem('mockDrugs'));
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
