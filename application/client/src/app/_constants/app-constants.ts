export const AppConstants = {
  baseUrl: 'http://localhost:3000',
  baseUserUrl: `${this.baseUrl}/api/users`,
  baseDrugUrl: `${this.baseUrl}/api/drugs`,
};

export const DefaultUser = {
  userId: 'admin',
  userSecret: 'adminpw',
  userType: 'admin'
};
