export interface User {
  userid: string;
  password: string;
  usertype: string;
}

export interface ApiUser {
  id: string;
  usertype: string;
}

export interface UserEnrollment extends ApiUser {
  enrolled: boolean;
}
