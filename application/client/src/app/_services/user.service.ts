import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // For testing without connecting to a blockchain network
  userSubject = new BehaviorSubject<User>(null); // starting with null.. to represent a non signed in user state
  private userCacheKey = 'currentUser';
  currentUser: User;

  constructor() {}

  setCurrentUser(user: User) {
    this.userSubject.next(user); // subscribers now have access to the newly authenticated user...

    localStorage.setItem(this.userCacheKey, JSON.stringify(user));
  }

  getCurrentUser() {
    const currentUser: User = JSON.parse(localStorage.getItem(this.userCacheKey));

    if (!currentUser) return;

    this.userSubject.next(currentUser); // subscribers now have access to the newly retrieved users from the local storage
  }

  removeCurrentUser()  {
    this.userSubject.next(null); // now no more signed in user... so reset state

    localStorage.removeItem(this.userCacheKey);
  }
}
