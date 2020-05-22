import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';

import {User} from '../_models/user';
import {Drug} from '../_models/drug';
import {UserService} from '../_services';
import {DrugService} from '../_services/drug.service';
import {ApiModel} from '../_models/api.model';
import {ApiStatusCodes} from '../_constants/app-constants';
import {MockDrugService} from '../_services/mock/mock.drug.service';

@Component({
  selector: 'app-manufacturer',
  templateUrl: './manufacturer.component.html',
  styleUrls: ['./manufacturer.component.scss']
})
export class ManufacturerComponent implements OnInit, OnDestroy {

  currentUser: User;
  userSubscription: Subscription;
  newDrugForm: FormGroup;
  submitted = false;
  success = false;

  error: string;

  constructor(private userService: UserService, private formBuilder: FormBuilder, private drugService: DrugService, private mockDrugService: MockDrugService) { }

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
    this.submitted = true;

    if (this.newDrugForm.invalid) {
      this.error = 'One or more fields is invalid. Please ensure all fields have been filled with valid values.';
      return;
    }

    const formDrugName: string = this.newDrugForm.controls.name.value;

    const drug: Drug = {
      drugId: `${formDrugName.toLowerCase()}${this.getRandomNum()}`,
      drugName: formDrugName,
      price: this.newDrugForm.controls.price.value,
      quantity: this.newDrugForm.controls.quantity.value,
      prescription: this.newDrugForm.controls.prescription.value,
      expiryDate: this.newDrugForm.controls.expiryDate.value,
      created: new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'})
    };

    this.mockDrugService.createDrug(drug)
      .subscribe((data: ApiModel<Drug>) => {

        console.log('data is ', data);
        if (data.code === ApiStatusCodes.SUCCESS) {
          console.log('successfully created drug');

          this.success = true;
        }
      }, error => {
        console.log('error in creating drug', error);
        this.error = 'ERROR manufacturing drug. Please make sure all fields have been filled.';

        this.success = false;
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
