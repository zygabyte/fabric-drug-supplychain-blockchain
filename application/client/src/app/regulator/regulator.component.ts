import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

import { UserService } from '../_services';
import {User} from '../_models/user';

@Component({
  selector: 'app-regulator',
  templateUrl: './regulator.component.html',
  styleUrls: ['./regulator.component.scss'],
  providers: [ ]
})

export class RegulatorComponent implements OnInit, OnDestroy {

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
