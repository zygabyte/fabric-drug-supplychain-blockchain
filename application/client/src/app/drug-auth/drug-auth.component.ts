import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DrugService} from '../_services/drug.service';
import {ApiModel} from '../_models/api.model';
import {DrugTransaction} from '../_models/drug';
import {ApiStatusCodes} from '../_constants/app-constants';
import {UserService} from '../_services';

@Component({
  selector: 'app-drug-auth',
  templateUrl: './drug-auth.component.html',
  styleUrls: ['./drug-auth.component.scss']
})
export class DrugAuthComponent implements OnInit {

  qrResultString: string;

  constructor(private drugService: DrugService, private router: Router, private userService: UserService) { }

  ngOnInit() {
  }

  clearResult(): void {
    this.qrResultString = null;
  }

  onScanSuccess(encryptedDrugId: string) {
    this.qrResultString = encryptedDrugId;
    console.log('result string');
    console.log(encryptedDrugId);

    this.drugService.authorizeDrug(encryptedDrugId)
      .subscribe((data: ApiModel<DrugTransaction>) => {
        if (data.code === ApiStatusCodes.SUCCESS) {
          console.log('successfully authorized drug movement');
          const currentUser = this.userService.getCurrentUser();

          this.router.navigate([currentUser.usertype]);
        }

      }, error => {
        console.log('error in authenticating drug ', error);
      });
  }

}