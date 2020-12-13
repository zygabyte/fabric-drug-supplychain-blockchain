import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule,
  MatTableModule, MatTabsModule, MatToolbarModule } from '@angular/material';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import {MatButtonModule} from '@angular/material/button';

/* Components */
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { EnrollComponent } from './enroll/enroll.component';
import { HomeComponent } from './home/home.component';
import { CustomerComponent } from './customer/customer.component';
import { ProducerComponent } from './producer/producer.component';
import { QueryorderComponent } from './queryorder/queryorder.component';
import { RegulatorComponent } from './regulator/regulator.component';
import { RetailerComponent } from './retailer/retailer.component';
import { ShipperComponent } from './shipper/shipper.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { WholesalerComponent } from './wholesaler/wholesaler.component';
import { DistributorComponent } from './distributor/distributor.component';
import { DrugsTableComponent } from './_partials/drugs-table/drugs-table.component';
import { ManufacturerComponent } from './manufacturer/manufacturer.component';
import { DrugTransactionsComponent } from './_partials/drug-transactions/drug-transactions.component';
import {DrugAuthComponent} from './drug-auth/drug-auth.component';

/* Partial Components */
import { OrderFormComponent } from './_partials/order-form/order-form.component';
import { OrderHistoryComponent } from './_partials/order-history/order-history.component';
import { OrdersTableComponent } from './_partials/orders-table/orders-table.component';
import { ToShipperDialog } from './_partials/orders-table/orders-table.component';
import { DeleteOrderDialog } from './_partials/orders-table/orders-table.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    EnrollComponent,
    CustomerComponent,
    ProducerComponent,
    QueryorderComponent,
    RegulatorComponent,
    RetailerComponent,
    ShipperComponent,
    UserManagementComponent,
    OrderFormComponent,
    OrderHistoryComponent,
    OrdersTableComponent,
    ToShipperDialog,
    DeleteOrderDialog,
    WholesalerComponent,
    DistributorComponent,
    DrugsTableComponent,
    ManufacturerComponent,
    DrugTransactionsComponent,
    DrugAuthComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    MatTableModule,
    MatToolbarModule,
    ZXingScannerModule,
    MatButtonModule
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ToShipperDialog,
    DeleteOrderDialog
  ]
})
export class AppModule { }
