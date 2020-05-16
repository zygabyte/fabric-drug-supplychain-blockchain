import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';

import { ApiService, AuthService } from '../_services';
import {SupplyChainActors} from '../_constants/app-constants';
import {User} from '../_models/user';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  providers: []
})

export class UserManagementComponent implements OnInit {
  newUser: Object;
  types: any[];
  supplyChainActors: string[];

  newUserForm: FormGroup;
  submitted = false;
  success = false;

  allUsers: MatTableDataSource<EditUser[]>;
  columnsToDisplay = ['id', 'usertype', 'enrolled'];

  constructor(private api: ApiService, private auth: AuthService, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.types = ["retailer", "producer", "shipper", "customer", "regulator"];
    this.supplyChainActors = Object.keys(SupplyChainActors);

    this.newUserForm = this.formBuilder.group({
      id: ['', Validators.required],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
      usertype: ['', Validators.required]
    });

    // get all users
    this.loadUserList(0);
  }

  onSubmit() {
    this.submitted = true;

    if (this.newUserForm.invalid) {
      return;
    }

    if (this.newUserForm.controls.password.value !== this.newUserForm.controls.confirm_password.value) {
      console.log('the passwords do not match');
      this.success = false;
      return;
    }

    const user: User = {
      userid: this.newUserForm.controls.id.value,
      password: this.newUserForm.controls.password.value,
      usertype: this.newUserForm.controls.usertype.value,
    };

    console.log(user);
    this.auth.registerUser(user).subscribe(res => {
      console.log(JSON.stringify(res));
      this.success = true;
    }, error => {
      console.log(JSON.stringify(error));
      this.success = false;
    });
  }

  loadUserList(tab) {
    if (tab == 0) {
      this.api.getAllUsers().subscribe(res => {
        var userArray = Object.keys(res).map(function (userIndex) {
          let user = res[userIndex];
          // do something with person
          return user;
        });
        //console.log(userArray);
        for (let user of userArray) {
          this.api.id = user.id;
          this.api.isUserEnrolled().subscribe(res => {
            // NOTE: adding a new user attribute called enrolled
            user.enrolled = res;
          }, error => {
            console.log(JSON.stringify(error));
          });
        }
        this.allUsers = new MatTableDataSource(userArray);
      }, error => {
        console.log(JSON.stringify(error));
        alert("Problem loading user list: " + error['error']['message']);
      });
    }
  }
}

export interface EditUser {
  id: string;
  usertype: string;
}
