import {Component, Input, OnInit} from '@angular/core';
import {DrugService} from '../../_services/drug.service';
import {ApiModel} from '../../_models/api.model';
import {DrugTransaction} from '../../_models/drug';
import {StatusCodes} from '../../_constants/app-constants';
import {MockDrugService} from '../../_services/mock/mock.drug.service';

@Component({
  selector: 'app-drug-transactions',
  templateUrl: './drug-transactions.component.html',
  styleUrls: ['./drug-transactions.component.scss']
})
export class DrugTransactionsComponent implements OnInit {

  drugTransactionHistory: DrugTransaction[];
  displayedColumns: string[] = ['DrugName', 'ModifiedBy', 'CurrentDrugState', 'Timestamp'];
  @Input() orderId: string;
  statuses: any;

  constructor(private drugService: DrugService, private mockDrugService: MockDrugService) { }

  ngOnInit() {
  }

  getDrugTransactionHistory(drugId: string) {
    this.mockDrugService.getDrugTransactionHistory(drugId).subscribe((data: ApiModel<DrugTransaction[]>) => {

      if (data.code === StatusCodes.success) {
        this.drugTransactionHistory = data.data;
      }
    });
  }
}
