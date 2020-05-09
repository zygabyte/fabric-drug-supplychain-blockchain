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
