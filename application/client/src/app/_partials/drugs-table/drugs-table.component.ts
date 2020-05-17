import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Subscription} from 'rxjs';
import {animate, state, style, transition, trigger} from '@angular/animations';

import {User} from '../../_models/user';
import {Drug} from '../../_models/drug';
import {Order} from '../orders-table/orders-table.component';
import {ApiService, UserService} from '../../_services';
import {DrugService} from '../../_services/drug.service';
import {MockDrugService} from '../../_services/mock/mock.drug.service';
import {DrugState, StatusCodes, SupplyChainActors} from '../../_constants/app-constants';
import {ApiModel} from '../../_models/api.model';

@Component({
  selector: 'app-drugs-table',
  templateUrl: './drugs-table.component.html',
  styleUrls: ['./drugs-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class DrugsTableComponent implements OnInit, OnDestroy {

  currentUser: User;
  userSubscription: Subscription;
  columnsToDisplay = ['drugId', 'drugName', 'price', 'quantity', 'created', 'expiryDate', 'status'];
  drugs: MatTableDataSource<Drug[]>;
  orders: MatTableDataSource<Order[]>;

  drugState: any;
  supplyChainActors: any;

  expandedElement: Drug | null;

  constructor(private userService: UserService, private drugService: DrugService, private apiService: ApiService, private mockDrugService: MockDrugService) { }

  ngOnInit() {
    this.userSubscription = this.userService.userSubject.subscribe((user: User) => {
      this.currentUser = user;
    });

    this.drugState = DrugState;
    this.supplyChainActors = SupplyChainActors;

    this.loadMockDrugs();
  }

  loadMockDrugs() {
    this.mockDrugService.getAllDrugs().subscribe((data: ApiModel<Drug[]> ) => {
      if (data.code === StatusCodes.success) {
        console.log('data is ', data.data);
        this.drugs = data.data;

        console.log('new data is ', this.drugs);
      }
    });
  }

  applyFilter(filterValue: string) {
    this.drugs.filter = filterValue.trim().toLowerCase();
  }

  manufacturerShipDrug(drugId: string) {
    this.mockDrugService.manufacturerShipDrug(drugId)
      .subscribe((data: ApiModel<Drug>) => {

        console.log('data is ', data);
        if (data.code === StatusCodes.success) {
          console.log(data.message);
        }
      }, error => {
        console.log('error in creating drug', error);
      });
  }

  distributorReceiveDrug(drugId: string) {
    this.mockDrugService.distributorReceiveDrug(drugId)
      .subscribe((data: ApiModel<Drug>) => {

        console.log('data is ', data);
        if (data.code === StatusCodes.success) {
          console.log(data.message);
        }
      }, error => {
        console.log('error in creating drug', error);
      });
  }

  distributorShipDrug(drugId: string) {
    this.mockDrugService.distributorShipDrug(drugId)
      .subscribe((data: ApiModel<Drug>) => {

        console.log('data is ', data);
        if (data.code === StatusCodes.success) {
          console.log(data.message);
        }
      }, error => {
        console.log('error in creating drug', error);
      });
  }

  wholesalerReceiveDrug(drugId: string) {
    this.mockDrugService.wholesalerReceiveDrug(drugId)
      .subscribe((data: ApiModel<Drug>) => {

        console.log('data is ', data);
        if (data.code === StatusCodes.success) {
          console.log(data.message);
        }
      }, error => {
        console.log('error in creating drug', error);
      });
  }

  wholesalerShipDrug(drugId: string) {
    this.mockDrugService.wholesalerShipDrug(drugId)
      .subscribe((data: ApiModel<Drug>) => {

        console.log('data is ', data);
        if (data.code === StatusCodes.success) {
          console.log(data.message);
        }
      }, error => {
        console.log('error in creating drug', error);
      });
  }

  retailerReceiveDrug(drugId: string) {
    this.mockDrugService.retailerReceiveDrug(drugId)
      .subscribe((data: ApiModel<Drug>) => {

        console.log('data is ', data);
        if (data.code === StatusCodes.success) {
          console.log(data.message);
        }
      }, error => {
        console.log('error in creating drug', error);
      });
  }

  retailerSellDrug(drugId: string) {
    this.mockDrugService.retailerSellDrug(drugId)
      .subscribe((data: ApiModel<Drug>) => {

        console.log('data is ', data);
        if (data.code === StatusCodes.success) {
          console.log(data.message);
        }
      }, error => {
        console.log('error in creating drug', error);
      });
  }

  deleteDrug(drugId: string) {

  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
