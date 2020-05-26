import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';

import { UserService } from '../_services';
import {User} from '../_models/user';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  providers: [ ]
})

export class CustomerComponent implements OnInit, OnDestroy {

  currentUser: User;
  userSubscription: Subscription;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userSubscription = this.userService.userSubject.subscribe((user: User) => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
