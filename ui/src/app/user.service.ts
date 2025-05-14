import { Injectable } from '@angular/core';
import { FIREBASE_URL, User, UserResponse } from './def';
import { map, Observable, of } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { HttpClient } from '@angular/common/http';
import { DataShareService } from './data-share.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userCache: User[] | null = null;
  private readonly CACHE_KEY = 'userCache';

  constructor(private firebaseService: FirebaseService, private http: HttpClient, private dataService: DataShareService) {
    const stored = localStorage.getItem(this.CACHE_KEY);
    if (stored) {
      try {
        this.userCache = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse cached users:', e);
        this.userCache = null;
      }
    }
  }

  getUserByEmail(email: string): Observable<User> {
    let url = FIREBASE_URL + "/user.json?equalTo=%22" + email + "%22&orderBy=%22email%22";
    return this.http.get<UserResponse>(url).pipe(map((response => {
      const key = Object.keys(response)[0];
      return response[key];
    })))
  }

  clearUserCache() {
    this.userCache = null;
    localStorage.removeItem(this.CACHE_KEY);
  }

  collectUsers(): Observable<User[]> {
    if (this.userCache) {
      return of(this.userCache);
    }
    return this.firebaseService.getRealTimeData<User[]>("/user")
  }

  getLoggedInUserDetails(): Observable<User | null> {
    const email = this.firebaseService.getLoggedInUserEmail()
    if (!email) return of(null)
    return this.getUserByEmail(email)
  }

  updateUser(user: User) {
    if (!this.getUserByEmail(user.email)) {
      this.firebaseService.updateFirebaseProperty<User>("/user", user, "updated").then(() => {
        this.dataService.showSuccessToast("Updated name", "Updated name of the user");
      })
    }
  }

}
