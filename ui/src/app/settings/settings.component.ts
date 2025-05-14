import { Component, OnInit } from '@angular/core';
import { HealthMetrics } from '../def';
import { faSave, faRefresh, faMicrochip, faMemory, faWifi, faRulerVertical, faTint, faBullhorn, faClock, faPowerOff, faStethoscope, faPlug } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { FirebaseService } from '../firebase.service';
import { HealthService } from '../health.service';
import { MotorService } from '../motor.service';
import { RebootService } from '../reboot.service';
import { DataShareService } from '../data-share.service';
import { faHourglassHalf } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  tankHeight: number = 0;
  autoTurnOffTime: number = 10;
  healthCheckDelay: number = 10;
  waterLevelNotificationDelta = 5;
  waterLevelHistoryNotificationDelta = 2;
  autoTurnOnTime!: string;
  autoTurnOnEnabled = false;

  faSave = faSave;
  faRefresh = faRefresh;
  faMicrochip = faMicrochip;
  faMemory = faMemory;
  faWifi = faWifi;
  faOilCan = faRulerVertical;
  faTint = faTint;
  faBullhorn = faBullhorn;
  faClock = faClock;
  faHourglassHalf = faHourglassHalf;
  faPowerOff = faPowerOff;
  faStethoscope = faStethoscope;
  faPlug = faPlug;

  health$: Observable<HealthMetrics>;

  constructor(private fireBaseService: FirebaseService,
    private healthService: HealthService,
    private motorService: MotorService,
    private rebootService: RebootService,
    private dataService: DataShareService
  ) {
    this.health$ = this.healthService.getLastHealthData();
  }
  ngOnInit(): void {
    this.dataService.notifyUrlChange('settings');
    this.fireBaseService.getRealTimeData<string>("/tankHeight").subscribe(data => this.tankHeight = +(data + ""))
    this.fireBaseService.getRealTimeData<string>("/autoTurnOffTime").subscribe(data => this.autoTurnOffTime = +(data + ""))
    this.fireBaseService.getRealTimeData<string>("/healthCheckDelay").subscribe(data => this.healthCheckDelay = +(data + ""))
    this.fireBaseService.getRealTimeData<string>("/waterLevelNotificationDelta").subscribe(data => this.waterLevelNotificationDelta = +(data + ""))
    this.fireBaseService.getRealTimeData<string>("/waterLevelHistoryNotificationDelta").subscribe(data => this.waterLevelHistoryNotificationDelta = +(data + ""))
    this.fireBaseService.getRealTimeData<string>("/autoTurnOnEnabled").subscribe(data => this.autoTurnOnEnabled = data + "" === "true")
    this.fireBaseService.getRealTimeData<string>("/autoTurnOnTime").subscribe(data => this.autoTurnOnTime = data)
  }

  doOTAUpdate() {
    this.rebootService.doOTAUpdate();
  }

  saveSettings() {
    console.log(this.autoTurnOnEnabled)
    this.motorService.updateTankHeight(this.tankHeight).then(() =>
      this.motorService.updateAutoTurnOffTime(this.autoTurnOffTime).then(() =>
        this.healthService.updateHealthCheckDelay(this.healthCheckDelay).then(() =>
          this.motorService.updateWaterLevelNotificationDelta(this.waterLevelNotificationDelta).then(() =>
            this.motorService.updateWaterLevelHistoryNotificationDelta(this.waterLevelHistoryNotificationDelta).then(() =>
              this.motorService.updateAutoTurnOnTime(this.autoTurnOnTime).then(() =>
                this.motorService.updateAutoTurnOnEnabled(this.autoTurnOnEnabled).then(() => {
                  this.dataService.showSuccessToast("Save successfull", "Data saved... Reboot in progress..")
                  this.forceReboot()
                })
              )
            )
          )
        )
      )
    )
  }

  forceReboot() {
    this.rebootService.forceReboot();
  }


}
