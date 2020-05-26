import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../_services';
import {SupplyChainActors} from '../_constants/app-constants';
import {User} from '../_models/user';

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.scss'],
  providers: []
})

export class EnrollComponent implements OnInit {

  enrollUserModel: User;
  loading = false;
  types: any[];
  supplyChainActors: string[];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.enrollUserModel = {
      userid: '', password: '', usertype: ''
    };

    this.types = ["retailer", "producer", "shipper", "customer", "regulator"];

    this.supplyChainActors = Object.keys(SupplyChainActors);
  }

  enrollUser() {
    this.loading = true;
    this.authService.enrollUser(this.enrollUserModel).subscribe(data => {
      alert("Enrollment was successful. User can log in to be taken to their portal.");
      this.router.navigate(['/login']);
    }, error => {
      this.loading = false;
      console.log(JSON.stringify(error));
      alert("Enrollment failed: " + error['error']['message']);
    });
  }
}
