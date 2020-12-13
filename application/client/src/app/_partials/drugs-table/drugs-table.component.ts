import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Subscription} from 'rxjs';
import {animate, state, style, transition, trigger} from '@angular/animations';

import {User} from '../../_models/user';
import {Drug, DrugTransaction} from '../../_models/drug';
import {UserService} from '../../_services';
import {DrugService} from '../../_services/drug.service';
import {DrugState, ApiStatusCodes, SupplyChainActors} from '../../_constants/app-constants';
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
  columnsToDisplay = ['drugId', 'drugName', 'price', 'quantity', 'created', 'expiryDate', 'currentState'];
  drugs: MatTableDataSource<DrugTransaction[]> = new MatTableDataSource<DrugTransaction[]>();

  drugState: any;
  supplyChainActors: any;

  expandedElement: Drug | null;

  constructor(private userService: UserService, private drugService: DrugService) { }

  ngOnInit() {
    this.userSubscription = this.userService.userSubject.subscribe((user: User) => {
      this.currentUser = user;
    });

    this.drugState = DrugState;
    this.supplyChainActors = SupplyChainActors;

    this.queryDrugs();
  }

  applyFilter(filterValue: string) {
    this.drugs.filter = filterValue.trim().toLowerCase();
  }

  manufacturerShipDrug(drugId: string) {
    this.drugService.manufacturerShipDrug(drugId)
      .subscribe((data: ApiModel<DrugTransaction>) => {

        console.log('data is ', data);
        if (data.code === ApiStatusCodes.SUCCESS) this.queryDrugs();

      }, error => {
        console.log('error in manufacturer shipping drug', error);
      });
  }

  distributorReceiveDrug(drugId: string) {
    this.drugService.distributorReceiveDrug(drugId)
      .subscribe((data: ApiModel<DrugTransaction>) => {

        console.log('data is ', data);
        if (data.code === ApiStatusCodes.SUCCESS) this.queryDrugs();

      }, error => {
        console.log('error in distributor receiving drug', error);
      });
  }

  distributorShipDrug(drugId: string) {
    this.drugService.distributorShipDrug(drugId)
      .subscribe((data: ApiModel<DrugTransaction>) => {

        console.log('data is ', data);
        if (data.code === ApiStatusCodes.SUCCESS) this.queryDrugs();

      }, error => {
        console.log('error in distributor shipping drug', error);
      });
  }

  wholesalerReceiveDrug(drugId: string) {
    this.drugService.wholesalerReceiveDrug(drugId)
      .subscribe((data: ApiModel<DrugTransaction>) => {

        console.log('data is ', data);
        if (data.code === ApiStatusCodes.SUCCESS) this.queryDrugs();

      }, error => {
        console.log('error in wholesaler receiving drug', error);
      });
  }

  wholesalerShipDrug(drugId: string) {
    this.drugService.wholesalerShipDrug(drugId)
      .subscribe((data: ApiModel<DrugTransaction>) => {

        console.log('data is ', data);
        if (data.code === ApiStatusCodes.SUCCESS) this.queryDrugs();

      }, error => {
        console.log('error in wholesaler shipping drug', error);
      });
  }

  retailerReceiveDrug(drugId: string) {
    this.drugService.retailerReceiveDrug(drugId)
      .subscribe((data: ApiModel<DrugTransaction>) => {

        console.log('data is ', data);
        if (data.code === ApiStatusCodes.SUCCESS) this.queryDrugs();

      }, error => {
        console.log('error in retailer receiving drug', error);
      });
  }

  retailerSellDrug(drugId: string) {
    this.drugService.retailerSellDrug(drugId)
      .subscribe((data: ApiModel<DrugTransaction>) => {

        console.log('data is ', data);
        if (data.code === ApiStatusCodes.SUCCESS) this.queryDrugs();

      }, error => {
        console.log('error in retailer shipping drug', error);
      });
  }

  deleteDrug(drugId: string) {

  }

  queryDrugs() {
    this.drugService.queryDrugs()
      .subscribe((data: ApiModel<DrugTransaction[]>) => {

        console.log('drug query', data);

        if (data.code === ApiStatusCodes.SUCCESS) this.drugs.data = JSON.parse(JSON.stringify(data.data));
      });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
