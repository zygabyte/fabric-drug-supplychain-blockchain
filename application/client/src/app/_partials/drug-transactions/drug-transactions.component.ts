import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';

import {DrugService} from '../../_services/drug.service';
import {ApiModel} from '../../_models/api.model';
import {DrugTransaction} from '../../_models/drug';
import {ApiStatusCodes} from '../../_constants/app-constants';

@Component({
  selector: 'app-drug-transactions',
  templateUrl: './drug-transactions.component.html',
  styleUrls: ['./drug-transactions.component.scss']
})
export class DrugTransactionsComponent {

  drugTransactionHistory: MatTableDataSource<DrugTransaction[]> = new MatTableDataSource<DrugTransaction[]>();
  displayedColumns: string[] = ['drugName', 'modifiedBy', 'currentState', 'timestamp'];

  constructor(private drugService: DrugService) { }

  getDrugTransactionHistory(drugId: string) {
    this.drugService.queryDrugTransactionHistory(drugId).subscribe((data: ApiModel<DrugTransaction[]>) => {

      if (data.code === ApiStatusCodes.SUCCESS) {
        this.drugTransactionHistory.data = JSON.parse(JSON.stringify(data.data));
        console.log(data);
      }
    });
  }
}
