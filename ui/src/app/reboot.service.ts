import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class RebootService {

  constructor(private firebaseService: FirebaseService) { }

  async doOTAUpdate() {
    this.firebaseService.updateFirebaseProperty<string>("otaUpdate", "YES", `Force ota update enabled`)
  }

  async forceReboot() {
    this.firebaseService.updateFirebaseProperty<string>("forceReboot", "YES", `Force rebooting enabled`)
  }

}
