import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Subscription} from 'rxjs';
import {animate, state, style, transition, trigger} from '@angular/animations';

import {ApiService, UserService} from '../_services';
import {User} from '../_models/user';
import {Drug} from '../_models/drug';
import {DrugService} from '../_services/drug.service';
import {Order} from '../_partials/orders-table/orders-table.component';
import {DrugState, StatusCodes, SupplyChainActors} from '../_constants/app-constants';
import {MockDrugService} from '../_services/mock/mock.drug.service';
import {ApiModel} from '../_models/api.model';

@Component({
  selector: 'app-retailer',
  templateUrl: './retailer.component.html',
  styleUrls: ['./retailer.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class RetailerComponent implements OnInit, OnDestroy {

  currentUser: User;
  userSubscription: Subscription;
  // columnsToDisplay = ['Drug Id', 'Drug Name', 'Price', 'Quantity', 'Producer Id', 'Status'];
  columnsToDisplay = ['drugId', 'drugName', 'price', 'quantity', 'manufacturerId', 'currentState'];
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
    // Load up the Orders from backend
    // this.apiService.orders$.subscribe(currentOrders => {
    //   this.orders = new MatTableDataSource(currentOrders);
    //   console.log('orders are ', this.orders);
    //   // this.cd.markForCheck();
    // });
    // this.apiService.queryOrders();

    // this.drugService.getAllDrugs().

    this.mockDrugService.getAllMockDrugs().subscribe((data: ApiModel<string> ) => {
      if (data.code === StatusCodes.success) {
        console.log('data is ', data.data);
        this.drugs = JSON.parse(data.data);

        console.log('new data is ', this.drugs);
      }
    });
  }

  applyFilter(filterValue: string) {
    this.drugs.filter = filterValue.trim().toLowerCase();
  }

  manufacturerShipDrug(drugId: string) {

  }

  distributorReceiveDrug(drugId: string) {

  }

  distributorShipDrug(drugId: string) {

  }

  wholesalerReceiveDrug(drugId: string) {

  }

  wholesalerShipDrug(drugId: string) {

  }

  retailerReceiveDrug(drugId: string) {
    console.log('drug to be received ', drugId);
  }

  retailerSellDrug(drugId: string) {
    console.log('drug to be sold ', drugId);
  }

  deleteDrug(drugId: string) {

  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
