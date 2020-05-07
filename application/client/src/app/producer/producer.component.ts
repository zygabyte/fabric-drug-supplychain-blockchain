import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { UserService } from '../_services/index';
import {Drug} from "../_models/drug";

@Component({
  selector: 'app-producer',
  templateUrl: './producer.component.html',
  styleUrls: ['./producer.component.scss']
})
export class ProducerComponent implements OnInit {

  currentUser: any;
  newDrugForm: FormGroup;
  submitted = false;
  success = false;

  constructor(private user: UserService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.currentUser = this.user.getCurrentUser();

    this.newDrugForm = this.formBuilder.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min]],
      expiryDate: ['', Validators.required],
      prescription: ['', Validators.required],
    });
  }

  onManufactureDrug(){
    if (this.newDrugForm.invalid) return;

    const drug: Drug = {
      drugId: '',
      drugName: this.newDrugForm.controls.name.value,
      price: this.newDrugForm.controls.price.value,
      quantity: this.newDrugForm.controls.quantity.value,
      prescription: this.newDrugForm.controls.prescription.value,
      expiryDate: this.newDrugForm.controls.expiryDate.value
    };


  }

}
