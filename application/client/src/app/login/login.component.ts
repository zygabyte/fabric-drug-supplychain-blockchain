import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService, UserService } from '../_services';
import {ApiModel} from '../_models/api.model';
import {ApiUser, User} from '../_models/user';
import {DefaultUser, StatusCodes} from '../_constants/app-constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: []
})

export class LoginComponent {
  user: User = {userid: '', password: '', usertype: ''};
  loading = false;

  constructor(private router: Router, private userService: UserService) { }

  login() {
    this.loading = true;

    this.userService.getUser(this.user.userid).subscribe((apiUser: ApiUser) => {
      this.user.usertype = apiUser.usertype;
      this.userService.setCurrentUser(this.user);

      if (apiUser.usertype === DefaultUser.userType) {
        this.router.navigate(['users']);
      } else {
        this.router.navigate([apiUser.usertype]);
      }
    }, error => {
      console.log(JSON.stringify(error));
      alert("Login failed: ");
      this.loading = false;
    });


    // use when updated ledger api
    // this.apiService.getUser().subscribe((data: ApiModel<ApiUser>) => {
    //   if (data.code === StatusCodes.success) {
    //     const retrievedUser = data.data;
    //     user.usertype = retrievedUser.usertype;
    //     this.userService.setCurrentUser(user);
    //
    //     if (retrievedUser.usertype === DefaultUser.userType) this.router.navigate(['users']);
    //     else this.router.navigate([retrievedUser.usertype]);
    //   }
    // }, error => {
    //   console.log(JSON.stringify(error));
    //   alert("Login failed: ");
    //   this.loading = false;
    // });
  }
}
