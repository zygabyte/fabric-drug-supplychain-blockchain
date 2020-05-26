import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {BehaviorSubject, Observable} from 'rxjs';

import {ApiService, AuthService, UserService} from '../_services';
import {ApiStatusCodes, SupplyChainActors} from '../_constants/app-constants';
import {ApiUser, User, UserEnrollment} from '../_models/user';
import {ApiModel} from '../_models/api.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})

export class UserManagementComponent implements OnInit {
  supplyChainActors: string[];

  newUserForm: FormGroup;
  submitted = false;
  success = false;

  error: string;

  allUsers: MatTableDataSource<UserEnrollment[]> = new MatTableDataSource<UserEnrollment[]>();
  columnsToDisplay = ['id', 'usertype', 'enrolled'];

  constructor(private formBuilder: FormBuilder, private userService: UserService, private auth: AuthService) {}

  ngOnInit() {
    this.supplyChainActors = Object.keys(SupplyChainActors);

    this.newUserForm = this.formBuilder.group({
      id: ['', Validators.required],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
      usertype: ['', Validators.required]
    });

    // get all users
    this.getAllUsers();
  }

  onRegisterUser() {
    this.submitted = true;

    if (this.newUserForm.invalid) {
      this.error = 'One or more fields is invalid. Please ensure all fields have been filled with valid values.';
      return;
    }

    if (this.newUserForm.controls.password.value !== this.newUserForm.controls.confirm_password.value) {
      this.error = 'The passwords do not match';
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
      console.log('response');
      console.log(res);

      this.success = true;
    }, error => {
      console.log(JSON.stringify(error));
      this.success = false;

      this.error = 'ERROR registering user. Please make sure all fields have been filled.';
    });
  }

  getAllUsers() {
    this.userService.getAllUsers().subscribe((users: ApiModel<ApiUser[]>) => {

      if (users.code === ApiStatusCodes.SUCCESS) {
        this.getUsersEnrollment(users.data).subscribe((usersEnrollment: UserEnrollment[]) => {
          if (usersEnrollment && usersEnrollment.length > 0) { this.allUsers.data = JSON.parse(JSON.stringify(usersEnrollment)); }
        });
      }
    }, error => {
      console.log(JSON.stringify(error));
      alert(`Problem loading user list: ${error.error.message}`);
    });
  }

  private getUsersEnrollment(apiUsers: ApiUser[]): Observable<UserEnrollment[]> {
    const usersEnrollment: UserEnrollment[] = [];

    const enrollmentSubject = new BehaviorSubject<UserEnrollment[]>(null);

    apiUsers.forEach(user => {
      this.userService.isUserEnrolled(user.id)
        .subscribe((userEnrolled: ApiModel<boolean>) => {
          if (userEnrolled.code === ApiStatusCodes.SUCCESS) { usersEnrollment.push({ id: user.id, usertype: user.usertype, enrolled: userEnrolled.data }); }

          if (usersEnrollment.length === apiUsers.length) { // at this point we've reached the capacity, so we can yield the observable result
            enrollmentSubject.next(usersEnrollment);
          }
        });
    });

    return enrollmentSubject.asObservable();
  }
}
