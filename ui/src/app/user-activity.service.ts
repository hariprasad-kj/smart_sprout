import { Injectable } from '@angular/core';
import { getDatabase, onValue, ref, set, push } from '@angular/fire/database';
import { getAuth } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { ActivityLog } from './def';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {

  private logsSubject = new BehaviorSubject<ActivityLog[]>([]);
  logs$ = this.logsSubject.asObservable();

  constructor() { }

  addActivity(status: string, system?: string) {
    const db = getDatabase();
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !user.email) return;
    var email;
    if (system) {
      email = "esp32@example.com"
    } else {
      email = user.email;
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
