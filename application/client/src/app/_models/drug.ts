export interface Drug {
  drugId: string;
  drugName: string;
  price: number;
  quantity: number;
  created: string;
  expiryDate: string;
  prescription: string;
}

// export interface Drug extends CreateDrug {
//   currentState: number;
//   manufacturerId: string;
//   distributorId: string;
//   wholesalerId: string;
//   retailerId: string;
//   timeStamp: string;
//   currentOwner: string;
//   status: string;
// }

export interface DrugTransaction extends Drug {
  transactionId: string;
  isDeleted: boolean;
  currentState: number;
  manufacturerId: string;
  distributorId: string;
  wholesalerId: string;
  retailerId: string;
  timeStamp: string;
  currentOwner: string;
  status: string;
}
