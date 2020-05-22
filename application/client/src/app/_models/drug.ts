export interface Drug {
  drugId: string;
  drugName: string;
  price: number;
  quantity: number;
  expiryDate: string;
  prescription: string;
  created: string;
}

export interface DrugTransaction extends Drug {
  currentState: string;
  manufacturerId: string;
  distributorId: string;
  wholesalerId: string;
  retailerId: string;
  timeStamp: string;
  currentOwner: string;
  transactionId: string;
  isDeleted: boolean;
}
