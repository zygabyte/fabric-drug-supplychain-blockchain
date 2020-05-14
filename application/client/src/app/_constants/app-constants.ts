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

export const StatusCodes = {
  success: 99,
  failure: 11,
  badrequest: 88,
  invalidCredentials: 56
};


export const DrugState = {
  DRUG_CREATED: 1,    // manufacturer
  MANUFACTURER_SHIPPED: 2,    // manufacturer
  DISTRIBUTOR_RECEIVED: 3,   // distributor
  DISTRIBUTOR_SHIPPED: 4,   // distributor
  WHOLESALER_RECEIVED: 5,  // wholesaler
  WHOLESALER_SHIPPED: 6,  // wholesaler
  RETAILER_RECEIVED: 7,  // retailer
  DRUG_SOLD: 8, // consumer
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
