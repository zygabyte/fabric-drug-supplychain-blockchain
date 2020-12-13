import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { EnrollComponent } from './enroll/enroll.component';
import { CustomerComponent } from './customer/customer.component';
import { ProducerComponent } from './producer/producer.component';
import { QueryorderComponent } from './queryorder/queryorder.component';
import { RegulatorComponent } from './regulator/regulator.component';
import { RetailerComponent } from './retailer/retailer.component';
import { ShipperComponent } from './shipper/shipper.component';
import {ManufacturerComponent} from './manufacturer/manufacturer.component';
import {DistributorComponent} from './distributor/distributor.component';
import {WholesalerComponent} from './wholesaler/wholesaler.component';
import { UserManagementComponent } from './user-management/user-management.component';
import {DrugTransactionsComponent} from './_partials/drug-transactions/drug-transactions.component';
import {DrugAuthComponent} from './drug-auth/drug-auth.component';

import { AuthGuard } from './_guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'enroll', component: EnrollComponent },
  // Main Pages
  { path: 'customer', component: CustomerComponent, canActivate: [AuthGuard] },
  { path: 'producer', component: ProducerComponent, canActivate: [AuthGuard] },
  { path: 'queryorder', component: QueryorderComponent },
  { path: 'regulator', component: RegulatorComponent, canActivate: [AuthGuard] },
  { path: 'shipper', component: ShipperComponent, canActivate: [AuthGuard] },
  { path: 'manufacturer', component: ManufacturerComponent, canActivate: [AuthGuard] },
  { path: 'distributor', component: DistributorComponent, canActivate: [AuthGuard] },
  { path: 'wholesaler', component: WholesalerComponent, canActivate: [AuthGuard] },
  { path: 'retailer', component: RetailerComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UserManagementComponent, canActivate: [AuthGuard] },
  { path: 'drug-transaction-history', component: DrugTransactionsComponent },
  { path: 'drug-auth', component: DrugAuthComponent },

  // otherwise redirect to login
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
