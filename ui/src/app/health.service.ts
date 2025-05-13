import { Injectable } from '@angular/core';
import { getDatabase, onValue, ref } from '@angular/fire/database';
import { FirebaseService } from './firebase.service';
import { FIREBASE_URL, HealthMetrics } from './def';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HealthService {

  private healthSubject = new BehaviorSubject<HealthMetrics[] | null>(null);
  public health$ = this.healthSubject.asObservable();

  constructor(private firebaseService: FirebaseService, private http: HttpClient) { }

  async updateHealthCheckDelay(healthCheckDelay: number) {
    this.firebaseService.updateFirebaseProperty<number>("healthCheckDelay", healthCheckDelay, `Updated health check delay to ${healthCheckDelay}`)
  }

  getHealthMetrics() {
    const db = getDatabase();
    const healthRef = ref(db, 'health/device_health');

    onValue(healthRef, (snapshot) => {
      const data = snapshot.val();
      const values: HealthMetrics[] = data ? Object.values(data) : [];
      this.healthSubject.next(values);
    });
  }

  getLastHealthData(): Observable<HealthMetrics> {
    let url = FIREBASE_URL + "/health/device_health.json?orderBy=%22timestamp%22&limitToLast=1"
    return this.http.get<HealthMetrics>(url);
  }

}