import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import { AuthService } from './_services';
import {UserService} from './_services';
import {User} from './_models/user';
import {map, take} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Drug Supplychain Blockchain';

  constructor(private router: Router, private authService: AuthService, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.setCurrentUserObservable();
  }

  home() {
    const user = this.userService.getCurrentUser();

    if (!user) { this.router.navigate(['/']); } else { this.router.navigate([user.usertype]); }
  }

  logout() {
    this.authService.logout();
  }
}
