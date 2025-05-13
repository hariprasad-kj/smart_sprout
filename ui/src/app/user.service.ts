import { Injectable } from '@angular/core';
import { User } from './def';
import { Database, onValue, ref } from '@angular/fire/database';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userCache: User[] | null = null;
  private readonly CACHE_KEY = 'userCache';

  constructor(private db: Database) {
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

  getUserByEmail(email: string): Observable<User | null> {
    return new Observable<User | null>((observer) => {
      const usersRef = ref(this.db, 'user');

      onValue(
        usersRef,
        (snapshot) => {
          const data = snapshot.val();

          if (data && typeof data === 'object') {
            const entries = Object.values(data) as User[];
            const name = entries.find(loc => loc?.email === email);
            observer.next(name ?? null);
            observer.complete();
          } else {
            observer.error('No data or invalid format');
          }
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }

  clearUserCache() {
    this.userCache = null;
    localStorage.removeItem(this.CACHE_KEY);
  }

  collectUsers(): Observable<User[]> {
    if (this.userCache) {
      return of(this.userCache);
    }

    return new Observable<User[]>((observer) => {
      const usersRef = ref(this.db, 'user');

      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
          const users = Object.values(data) as User[];
          this.userCache = users;

          // Save to localStorage
          localStorage.setItem(this.CACHE_KEY, JSON.stringify(users));

          observer.next(users);
        } else {
          this.userCache = [];
          localStorage.setItem(this.CACHE_KEY, '[]');
          observer.next([]);
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

}
