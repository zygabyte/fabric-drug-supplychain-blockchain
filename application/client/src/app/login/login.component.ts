import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../_services';
import {ApiModel} from '../_models/api.model';
import {ApiUser, User} from '../_models/user';
import {DefaultUser, ApiStatusCodes} from '../_constants/app-constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  user: User = {userid: '', password: '', usertype: ''};
  loading = false;

  constructor(private router: Router, private userService: UserService) { }

  login() {
    this.loading = true;

    this.userService.getUser(this.user.userid).subscribe((data: ApiModel<ApiUser>) => {
      if (data.code === ApiStatusCodes.SUCCESS) {
        const retrievedUser = data.data;
        this.user.usertype = retrievedUser.usertype;
        this.userService.setCurrentUser(this.user);

        if (retrievedUser.usertype === DefaultUser.userType) { this.router.navigate(['users']); }
        else { this.router.navigate([retrievedUser.usertype]); }
      }
    }, error => {
      console.log(JSON.stringify(error));
      alert('Login failed. Please retry with valid credentials.');
      this.loading = false;
    });
  }
}
