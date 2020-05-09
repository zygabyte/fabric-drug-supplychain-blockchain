import {Component, OnInit} from '@angular/core';
import { AuthService } from './_services';
import {UserService} from './_services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Generic Supplychain Blockchain Sample';

  constructor(private authService: AuthService, private userService: UserService){}

  ngOnInit(): void {
    this.userService.getCurrentUser();
  }

  logout() {
    console.log('inside Logout');
    this.authService.logout();
  }
}
