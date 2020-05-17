import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';

import {ApiModel} from '../../_models/api.model';
import {CreateDrug, Drug} from '../../_models/drug';
import {DrugState, DrugStateUtil, StatusCodes} from '../../_constants/app-constants';
import {User} from '../../_models/user';
import {UserService} from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class MockDrugService implements OnDestroy {

  currentUser: User;
  userSubscription: Subscription;

  mockDrugsSubject = new BehaviorSubject<ApiModel<Drug[]>>(null);

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

  constructor(private userService: UserService) {
    this.userSubscription = this.userService.userSubject.subscribe((user: User) => {
      this.currentUser = user;
    });
  }

  getAllDrugs(): Observable<ApiModel<Drug[]>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    const mockDrugsModel: ApiModel<Drug[]> = {
      code: StatusCodes.success,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    return this.mockDrugsSubject.asObservable();
  }


  getDrug(drugId: string): Observable<ApiModel<Drug>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    const mockDrugModel: ApiModel<Drug> = {
      code: StatusCodes.success,
      message: 'successfully retrieved drug',
      data: this.mockDrugs.find(mockDrug => mockDrug.drugId === drugId)
    };

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  createDrug(drug: CreateDrug): Observable<ApiModel<Drug>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    const newDrug: Drug = {
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
      manufacturerShipped: '',
      distributorReceived: '',
      distributorShipped: '',
      wholesalerReceived: '',
      wholesalerShipped: '',
      retailerReceived: '',
      sold: '',
      currentOwner: this.currentUser.userid,
      status: DrugStateUtil.getDrugStateName(DrugState.DRUG_CREATED)
    };

    this.mockDrugs.push(newDrug);

    const mockDrugModel: ApiModel<Drug> = {
      code: StatusCodes.success,
      message: 'successfully created drug',
      data: newDrug
    };

    const mockDrugsModel: ApiModel<Drug[]> = {
      code: StatusCodes.success,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  manufacturerShipDrug(drugId: string): Observable<ApiModel<Drug>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: Drug;

    this.mockDrugs.find((mockDrug, index) => {
      if (mockDrug.drugId === drugId) {
        mockDrug.currentState = DrugState.MANUFACTURER_SHIPPED;
        mockDrug.status = DrugStateUtil.getDrugStateName(DrugState.MANUFACTURER_SHIPPED);
        mockDrug.manufacturerShipped = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        this.mockDrugs = this.replaceDrugInMockDrug(index, mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<Drug> = {
      code: StatusCodes.success,
      message: 'manufacturer successfully shipped drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<Drug[]> = {
      code: StatusCodes.success,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  distributorReceiveDrug(drugId: string): Observable<ApiModel<Drug>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: Drug;

    this.mockDrugs.find((mockDrug, index) => {
      if (mockDrug.drugId === drugId) {
        mockDrug.currentState = DrugState.DISTRIBUTOR_RECEIVED;
        mockDrug.status = DrugStateUtil.getDrugStateName(DrugState.DISTRIBUTOR_RECEIVED);
        mockDrug.distributorReceived = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        mockDrug.distributorId = this.currentUser.userid;
        this.mockDrugs = this.replaceDrugInMockDrug(index, mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<Drug> = {
      code: StatusCodes.success,
      message: 'distributor successfully received drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<Drug[]> = {
      code: StatusCodes.success,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  distributorShipDrug(drugId: string): Observable<ApiModel<Drug>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: Drug;

    this.mockDrugs.find((mockDrug, index) => {
      if (mockDrug.drugId === drugId) {
        mockDrug.currentState = DrugState.DISTRIBUTOR_SHIPPED;
        mockDrug.status = DrugStateUtil.getDrugStateName(DrugState.DISTRIBUTOR_SHIPPED);
        mockDrug.distributorShipped = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        this.mockDrugs = this.replaceDrugInMockDrug(index, mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<Drug> = {
      code: StatusCodes.success,
      message: 'distributor successfully shipped drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<Drug[]> = {
      code: StatusCodes.success,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  wholesalerReceiveDrug(drugId: string): Observable<ApiModel<Drug>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: Drug;

    this.mockDrugs.find((mockDrug, index) => {
      if (mockDrug.drugId === drugId) {
        mockDrug.currentState = DrugState.WHOLESALER_RECEIVED;
        mockDrug.status = DrugStateUtil.getDrugStateName(DrugState.WHOLESALER_RECEIVED);
        mockDrug.wholesalerReceived = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        mockDrug.wholesalerId = this.currentUser.userid;
        this.mockDrugs = this.replaceDrugInMockDrug(index, mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<Drug> = {
      code: StatusCodes.success,
      message: 'wholesaler successfully received drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<Drug[]> = {
      code: StatusCodes.success,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  wholesalerShipDrug(drugId: string): Observable<ApiModel<Drug>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: Drug;

    this.mockDrugs.find((mockDrug, index) => {
      if (mockDrug.drugId === drugId) {
        mockDrug.currentState = DrugState.WHOLESALER_SHIPPED;
        mockDrug.status = DrugStateUtil.getDrugStateName(DrugState.WHOLESALER_SHIPPED);
        mockDrug.wholesalerShipped = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        this.mockDrugs = this.replaceDrugInMockDrug(index, mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<Drug> = {
      code: StatusCodes.success,
      message: 'wholesaler successfully shipped drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<Drug[]> = {
      code: StatusCodes.success,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  retailerReceiveDrug(drugId: string): Observable<ApiModel<Drug>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: Drug;

    this.mockDrugs.find((mockDrug, index) => {
      if (mockDrug.drugId === drugId) {
        mockDrug.currentState = DrugState.RETAILER_RECEIVED;
        mockDrug.status = DrugStateUtil.getDrugStateName(DrugState.RETAILER_RECEIVED);
        mockDrug.retailerReceived = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        mockDrug.retailerId = this.currentUser.userid;
        this.mockDrugs = this.replaceDrugInMockDrug(index, mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<Drug> = {
      code: StatusCodes.success,
      message: 'retailer successfully received drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<Drug[]> = {
      code: StatusCodes.success,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  retailerSellDrug(drugId: string): Observable<ApiModel<Drug>> {
    this.mockDrugs = this.getDrugsFromLocalStorage();

    let foundDrug: Drug;

    this.mockDrugs.find((mockDrug, index) => {
      if (mockDrug.drugId === drugId) {
        mockDrug.currentState = DrugState.DRUG_SOLD;
        mockDrug.status = DrugStateUtil.getDrugStateName(DrugState.DRUG_SOLD);
        mockDrug.sold = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
        mockDrug.currentOwner = this.currentUser.userid;
        this.mockDrugs = this.replaceDrugInMockDrug(index, mockDrug);

        foundDrug = mockDrug;
        return true;
      }

      return false;
    });

    const mockDrugModel: ApiModel<Drug> = {
      code: StatusCodes.success,
      message: 'retailer successfully sold drug',
      data: foundDrug
    };

    const mockDrugsModel: ApiModel<Drug[]> = {
      code: StatusCodes.success,
      message: 'successfully retrieved drugs',
      data: this.mockDrugs
    };

    this.mockDrugsSubject.next(mockDrugsModel);

    this.storeDrugsInLocalStorage();

    return new Observable((data) => {
      data.next(mockDrugModel);
    });
  }

  private replaceDrugInMockDrug(index: number, newDrug: Drug): Drug [] {
    return Object.assign([], this.mockDrugs, {index: newDrug});
  }

  private storeDrugsInLocalStorage() {
    localStorage.setItem('mockDrugs', JSON.stringify(this.mockDrugs));
  }

  private getDrugsFromLocalStorage(): Drug[] {
    const storedDrugs = localStorage.getItem('mockDrugs');

    if (storedDrugs) return JSON.parse(storedDrugs);

    this.storeDrugsInLocalStorage(); // reset drugs in local store... usually for first time call

    return JSON.parse(localStorage.getItem('mockDrugs'));
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
