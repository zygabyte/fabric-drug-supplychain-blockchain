export interface CreateDrug {
  drugId: string;
  drugName: string;
  price: number;
  quantity: number;
  expiryDate: string;
  prescription: string;
}

export interface Drug extends CreateDrug {
  currentState: number;
  manufacturerId: string;
  distributorId: string;
  wholesalerId: string;
  retailerId: string;
  created: string;
  manufacturerShipped: string;
  distributorReceived: string;
  distributorShipped: string;
  wholesalerReceived: string;
  wholesalerShipped: string;
  retailerReceived: string;
  sold: string;
  currentOwner: string;
}
