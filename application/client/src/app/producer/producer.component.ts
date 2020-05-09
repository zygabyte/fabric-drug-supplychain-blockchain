import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';

import { UserService } from '../_services';
import {Drug} from '../_models/drug';
import {DrugService} from '../_services/drug.service';
import {ApiModel} from '../_models/api.model';
import {StatusCodes} from '../_constants/app-constants';
import {User} from '../_models/user';

@Component({
  selector: 'app-producer',
  templateUrl: './producer.component.html',
  styleUrls: ['./producer.component.scss']
})
export class ProducerComponent implements OnInit, OnDestroy {

  currentUser: User;
  userSubscription: Subscription;
  newDrugForm: FormGroup;
  submitted = false;
  success = false;

  manufacturedDrugs: Drug[];

  constructor(private userService: UserService, private formBuilder: FormBuilder, private drugService: DrugService) { }

  ngOnInit() {
    this.userSubscription = this.userService.userSubject.subscribe((user: User) => {
      this.currentUser = user;
    });

    this.newDrugForm = this.formBuilder.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min]],
      expiryDate: ['', Validators.required],
      prescription: ['', Validators.required],
    });
  }

  onManufactureDrug() {
    if (this.newDrugForm.invalid) { return; }

    const formDrugName: string = this.newDrugForm.controls.name.value;

    const drug: Drug = {
      drugId: `${formDrugName}${this.getRandomNum()}`,
      drugName: formDrugName,
      price: this.newDrugForm.controls.price.value,
      quantity: this.newDrugForm.controls.quantity.value,
      prescription: this.newDrugForm.controls.prescription.value,
      expiryDate: this.newDrugForm.controls.expiryDate.value
    };

    this.drugService.createDrug(drug)
      .subscribe((data: ApiModel<string>) => {

        console.log('data is ', data);
        if (data.code === StatusCodes.success) {
          console.log('successfully created drug');
        }
      }, error => {
        console.log('error in creating drug', error);
      });
  }

  getRandomNum(): string {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4()}${s4()}${s4()}${s4()}`;
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

}
