import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Database, onValue, push, ref, set } from '@angular/fire/database';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private db: Database) { }

  getRealTimeData<T>(path: string): Observable<T> {
    return new Observable(observer => {
      const dataRef = ref(this.db, path);
      onValue(dataRef, (snapshot) => {
        observer.next(snapshot.val());
      });
    });
  }

  async updateFirebaseProperty<T>(property: string, content: T, successMessage: string) {
    try {
      await set(ref(this.db, property), content);
      return console.log(successMessage);
    } catch (error) {
      return console.error('Error updating ' + property + ':', error);
    }
  }

  async pushIntoFirebaseProperty<T>(property: string, content: T, successMessage: string) {
    try {
      await push(ref(this.db, property), content);
      return console.log(successMessage);
    } catch (error) {
      return console.error('Error updating ' + property + ':', error);
    }
  }

  getLoggedInUserEmail(): string | undefined {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !user.email) return undefined;
    return user.email;
  }

}
