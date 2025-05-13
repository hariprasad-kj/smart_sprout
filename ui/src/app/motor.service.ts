import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class MotorService {

  constructor(private firebaseService: FirebaseService) { }

  async updateMotorStatus(status: string) {
    this.firebaseService.updateFirebaseProperty<string>("status", status, `Motor status updated to ${status}`)
  }

  async updateAutoTurnOffTime(autoTurnOffTime: number) {
    this.firebaseService.updateFirebaseProperty<number>("autoTurnOffTime", autoTurnOffTime, `Updated auto turn off time to ${autoTurnOffTime}`)
  }

  async updateTankHeight(tankHeight: number) {
    this.firebaseService.updateFirebaseProperty<number>("tankHeight", tankHeight, `Updated tank height to ${tankHeight}`)
  }

  async updateWaterLevelNotificationDelta(waterLevelNotificationDelta: number) {
    this.firebaseService.updateFirebaseProperty<number>("waterLevelNotificationDelta", waterLevelNotificationDelta, `Updated water level delta to ${waterLevelNotificationDelta}`)
  }

  async updateWaterLevelHistoryNotificationDelta(waterLevelHistoryNotificationDelta: number) {
    this.firebaseService.updateFirebaseProperty<number>("waterLevelHistoryNotificationDelta", waterLevelHistoryNotificationDelta, `Updated water level history delta to ${waterLevelHistoryNotificationDelta}`)
  }

  async updateAutoTurnOnTime(autoTurnOnTime: string) {
    this.firebaseService.updateFirebaseProperty<string>("autoTurnOnTime", autoTurnOnTime, `Updated Auto turn on time to ${autoTurnOnTime}`)
  }

  async updateAutoTurnOnEnabled(autoTurnOnEnabled: boolean) {
    this.firebaseService.updateFirebaseProperty<boolean>("autoTurnOnEnabled", autoTurnOnEnabled, `Updated auto turn on enabled to ${autoTurnOnEnabled}`)
  }

}
