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
  currentState: number;
  manufacturerId: string;
  distributorId: string;
  wholesalerId: string;
  retailerId: string;
  timeStamp: string;
  currentOwner: string;
  transactionId: string;
  isDeleted: boolean;
  currentStateName: string;
}

export class DrugStateUtil {
  static getDrugStateName(drugState: number): string {
    switch (drugState) {
      case 1:
        return 'DRUG_CREATED';

      case 2:
        return 'MANUFACTURER_SHIPPED';

      case 3:
        return 'DISTRIBUTOR_RECEIVED';

      case 4:
        return 'DISTRIBUTOR_SHIPPED';

      case 5:
        return 'WHOLESALER_RECEIVED';

      case 6:
        return 'WHOLESALER_SHIPPED';

      case 7:
        return 'RETAILER_RECEIVED';

      case 8:
        return 'DRUG_SOLD';

      default:
        return 'Invalid State';
    }
  }
}
