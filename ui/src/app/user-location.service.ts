import { Injectable } from '@angular/core';
import { getDatabase, Database, onValue, ref, set, push, get, child } from '@angular/fire/database';
import { combineLatest, Observable, of } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { LocationData, MapData, UserLocation } from './def';
import { UserService } from './user.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserLocationService {

  constructor(private db: Database, private userService: UserService) { }

  async setUserLocation(data: MapData) {
    const db = getDatabase();
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const locationRef = ref(db, 'userLocation');
    const locationData = {
      email: user.email,
      lat: data.location.lat,
      long: data.location.lon,
      place: data.location.display_name,
      zoom: data.zoom,
      timestamp: Date.now()
    };

    try {
      const snapshot = await get(locationRef);
      const userLocations = snapshot.val() || {};
      let existingKey: string | null = null;

      for (const [key, value] of Object.entries(userLocations)) {
        if ((value as any)?.email === user.email) {
          existingKey = key;
          break;
        }
      }

      if (existingKey) {
        const userRef = child(locationRef, existingKey);
        await set(userRef, locationData);
      } else {
        await push(locationRef, locationData);
      }
    } catch (err) {
      console.error('Location setting failed', err);
    }
  }

  collectUserLocation(email: string): Observable<LocationData | null> {
    return new Observable<LocationData | null>((observer) => {
      const usersRef = ref(this.db, 'userLocation');

      onValue(
        usersRef,
        (snapshot) => {
          const data = snapshot.val();

          if (data && typeof data === 'object') {
            const entries = Object.values(data) as LocationData[];
            const userLocation = entries.find(loc => loc?.email === email);
            observer.next(userLocation ?? null);
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

  getUserLocationInfo(): Observable<UserLocation | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && user.email) {
      let email: string = user.email;
      const location$ = this.collectUserLocation(email);
      const user$ = this.userService.getUserByEmail(email);

      return combineLatest([user$, location$]).pipe(
        map(([user, location]) => ({ user, location }))
      );
    }
    return of(null)
  }

}
