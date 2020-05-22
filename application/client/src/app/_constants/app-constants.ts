const baseUrl = 'http://localhost:3000';

export const AppConstants = {
  baseUrl,
  baseUserUrl: `${baseUrl}/api/users`,
  baseDrugUrl: `${baseUrl}/api/drugs`,
};

export const DefaultUser = {
  userId: 'admin',
  userSecret: 'adminpw',
  userType: 'admin'
};

export const ApiStatusCodes = {
  SUCCESS: 0,
  DRUG_NOT_FOUND: 1001,
  DRUG_NOT_CREATED: 1002,
  DRUG_NOT_SHIPPED: 1003,
  DRUG_NOT_RECEIVED: 1004,
  DRUG_NOT_SOLD: 1005,
  USER_NOT_ENROLLED: 1006,
  USER_NOT_FOUND: 1007,
  USER_NOT_REGISTERED: 1008,
  INVALID_USER_HEADER: 1009
};

export const DrugState = {
  DRUG_CREATED: 'DRUG_CREATED',    // manufacturer
  MANUFACTURER_SHIPPED: 'MANUFACTURER_SHIPPED',    // manufacturer
  DISTRIBUTOR_RECEIVED: 'DISTRIBUTOR_RECEIVED',   // distributor
  DISTRIBUTOR_SHIPPED: 'DISTRIBUTOR_SHIPPED',   // distributor
  WHOLESALER_RECEIVED: 'WHOLESALER_RECEIVED',  // wholesaler
  WHOLESALER_SHIPPED: 'WHOLESALER_SHIPPED',  // wholesaler
  RETAILER_RECEIVED: 'RETAILER_RECEIVED',  // retailer
  DRUG_SOLD: 'DRUG_SOLD' // consumer
};

export const SupplyChainActors = {
  regulator: 'regulator',
  manufacturer: 'manufacturer',
  distributor: 'distributor',
  wholesaler: 'wholesaler',
  retailer: 'retailer',
  consumer: 'consumer',
  admin: 'admin',
};
