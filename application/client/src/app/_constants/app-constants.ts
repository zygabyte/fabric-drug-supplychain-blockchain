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
  DRUG_CREATED: 1,    // manufacturer
  MANUFACTURER_SHIPPED: 2,    // manufacturer
  DISTRIBUTOR_RECEIVED: 3,   // distributor
  DISTRIBUTOR_SHIPPED: 4,   // distributor
  WHOLESALER_RECEIVED: 5,  // wholesaler
  WHOLESALER_SHIPPED: 6,  // wholesaler
  RETAILER_RECEIVED: 7,  // retailer
  DRUG_SOLD: 8 // consumer
};

export const SupplyChainActors = {
  // regulator: 'regulator',
  manufacturer: 'manufacturer',
  distributor: 'distributor',
  wholesaler: 'wholesaler',
  retailer: 'retailer',
  // consumer: 'consumer',
  // admin: 'admin',
};

export const SupplyChainActorsDropDown = {
  manufacturer: 'manufacturer',
  distributor: 'distributor',
  wholesaler: 'wholesaler',
  retailer: 'retailer'
};

export const DrugSgtin = {
  header: '48',
  filter: '1',
  partition: '5'
};
