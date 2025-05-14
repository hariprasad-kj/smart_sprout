import { Injectable } from '@angular/core';
import { getDatabase, onValue, ref, set, push } from '@angular/fire/database';
import { BehaviorSubject } from 'rxjs';
import { ActivityLog } from './def';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {

  private logsSubject = new BehaviorSubject<ActivityLog[]>([]);
  logs$ = this.logsSubject.asObservable();

  constructor(private firebaseService: FirebaseService) { }

  addActivity(status: string, system?: string) {
    const db = getDatabase();
    var email = this.firebaseService.getLoggedInUserEmail();
    if (system) {
      email = "esp32@example.com"
    }

    const logRef = ref(db, 'activityLogs');
    const lastActionRef = ref(db, 'lastAction');

    const logData = {
      user: email,
      action: status === 'ON' ? 'Turned OFF' : 'Turned ON',
      timestamp: Date.now()
    };

    const lastAction = {
      user: email,
      timestamp: Date.now()
    };

    push(logRef, logData)
      .then(() => console.log('Activity logged'))
      .catch(err => console.error('Logging failed', err));

    set(lastActionRef, lastAction)
      .then(() => console.log('Activity logged'))
      .catch(err => console.error('Logging failed', err));

  }

  loadLogs(): void {
    const db = getDatabase();
    const logRef = ref(db, 'activityLogs');

    onValue(logRef, (snapshot) => {
      const data = snapshot.val();
      const logs = data ? Object.values(data) as ActivityLog[] : [];
      this.logsSubject.next(logs);
    });
  }

}
