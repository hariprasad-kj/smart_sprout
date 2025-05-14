import { Component, OnInit } from '@angular/core';
import { ChartDef, DeviceLogByDate, getRainIcon, HourlyMap, LastAction, MotorLog, Motorlogs, MotorOnOff, RainMessage, standardiseDate, timeDiff, WaterData, Weather } from '../def';
import { faChartPie, faClock, faCloudSunRain, faLayerGroup, faTemperatureHigh, faTint, faWater, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { WeatherService } from '../weather.service';
import { DatePipe } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { UserLocationService } from '../user-location.service';
import { MotorService } from '../motor.service';
import { UserActivityService } from '../user-activity.service';
import { UserService } from '../user.service';
import { HealthService } from '../health.service';
import { DataShareService } from '../data-share.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  faTint = faTint;
  faWater = faWater;
  faClock = faClock;
  faTemperatureHigh = faTemperatureHigh;
  faCloudSunRain = faCloudSunRain;
  faChartPie = faChartPie;
  faLayerGroup = faLayerGroup;

  title = 'SmartSprout';
  motorStatus: string = "";
  water = "";
  motorOnOff: MotorOnOff[] = [];
  lastAction!: LastAction
  currentWeather!: Weather;
  hourMap: HourlyMap[] = []
  hourWeather!: HourlyMap;
  rainMessage: RainMessage = RainMessage.None;
  rainIcon!: IconDefinition;

  motorChartData!: ChartDef
  temperatureChartData!: ChartDef
  humidityChartData!: ChartDef
  healthChartData!: ChartDef

  dates: string[] = [];
  freeHeap: number[] = []
  chartShowing: number = 1;
  motorLogs: MotorLog[] = [];
  isAlive = false;

  constructor(private firebaseService: FirebaseService,
    private userActivityService: UserActivityService,
    private motorService: MotorService,
    private userLocationService: UserLocationService,
    private weatherService: WeatherService,
    private userService: UserService,
    private healthService: HealthService,
    private dataService: DataShareService
  ) {
    this.dataService.isAlive$.subscribe(data => this.isAlive = data)
  }

  ngOnInit(): void {
    this.dataService.notifyUrlChange('dashboard');
    this.loadMotorStatus();
    this.loadLastAction();
    this.collectMotorStatus(true);
    this.collectWeatherData();
    this.collectHealthMetrics();
  }

  loadMotorStatus() {
    this.firebaseService.getRealTimeData<DeviceLogByDate>("/logs").subscribe(data => {
      let keys = Object.keys(data)
      keys.forEach(key => {
        let motorLog: MotorLog = { date: key, logs: [] };
        let subKeys = Object.keys(data[key])
        subKeys.forEach(subKey => {
          let log: Motorlogs = data[key][subKey]
          log.turnedOnSeconds = timeDiff(log.on, log.off)
          motorLog.logs.push(log)
        })
        motorLog.totalSeconds = motorLog.logs.map(log => log.turnedOnSeconds).reduce((a, b) => a! + b!)
        motorLog.totalMinutes = +(motorLog.totalSeconds! / 60).toFixed(2)
        this.motorLogs.push(motorLog)
      })
      console.log(this.motorLogs)
    })
  }

  collectHealthMetrics() {
    this.chartShowing = 1;
    this.healthService.getHealthMetrics()
    this.healthService.health$.subscribe(data => {
      if (data) {
        data.map(content => this.dates.push(content.timestamp))
        data.map(content => this.freeHeap.push(content.freeHeap))
        this.showHealthchart(standardiseDate(this.dates), this.freeHeap);
      }
    })
  }

  collectWeatherData() {
    this.userLocationService.getUserLocationInfo().subscribe(userData => {
      if (userData && userData.location && userData.location.lat && userData.location.long) {
        this.weatherService.getCurrentWeather(userData.location.lat, userData.location.long).subscribe(data => {
          this.currentWeather = data;
          data.hourly.time.forEach((_content, i) => {
            this.hourMap.push({
              precipitation: data.hourly.precipitation[i],
              relativehumidity_2m: data.hourly.relativehumidity_2m[i],
              time: data.hourly.time[i]
            })
          })
          let filtered = this.hourMap.filter(content => {
            let contentTime = new DatePipe("en").transform(content.time, "yyyy-MM-ddTHH");
            let currentTime = new DatePipe("en").transform(data.current_weather.time, "yyyy-MM-ddTHH");
            if (contentTime && currentTime) {
              return contentTime.startsWith(currentTime)
            }
            return false
          });
          if (filtered && filtered.length > 0) {
            this.hourWeather = filtered[0];
            if (this.hourWeather.precipitation === 0) {
              this.rainMessage = RainMessage.None
            } else if (this.hourWeather.precipitation >= 0.1 || this.hourWeather.precipitation <= 2.5) {
              this.rainMessage = RainMessage.Light
            } else if (this.hourWeather.precipitation >= 2.6 || this.hourWeather.precipitation <= 7.6) {
              this.rainMessage = RainMessage.Moderate
            } else if (this.hourWeather.precipitation >= 7.7 || this.hourWeather.precipitation <= 50) {
              this.rainMessage = RainMessage.Heavy
            } else {
              this.rainMessage = RainMessage.VeryHeavy
            }
            this.rainIcon = getRainIcon(this.rainMessage)
          }
        })
      }
    })
  }

  collectWaterLevel() {
    this.firebaseService.getRealTimeData<WaterData>("/waterData").subscribe(data => {
      let waterPercent = data.percentage
      if (+waterPercent < 20) {
        this.dataService.showDangerToast("Insufficient water level", "Insufficient water level, cannot turn on")
        this.turnOffMotor();
      }
      this.water = waterPercent;
    })
  }

  turnOffMotor() {
    this.motorService.updateMotorStatus("OFF")
      .then(() => {
        this.collectMotorStatus()
      })
      .catch(error => console.error('Error updating data:', error));
    this.addActivity("system")
  }


  changeMotorStatus() {
    if (!this.isAlive) {
      this.dataService.showWarningToast("Non-live IC", "IC is not alive... please try again later")
    } else {
      if (+this.water > 20) {
        let status = this.motorStatus === "ON" ? "OFF" : "ON"
        this.dataService.showSuccessToast("Motor status changed", "It may take a few seconds for actual update w.r.t. network speed")
        this.motorService.updateMotorStatus(status).then(() => {
          this.collectMotorStatus()
        }).catch(error =>
          console.error('Error updating data:', error)
        );
        this.addActivity()
      } else {
        this.dataService.showDangerToast("Insufficient water level", "Insufficient water level, cannot turn on")
        this.addActivity("system")
      }
    }
  }

  addActivity(system?: string) {
    if (system) {
      this.userActivityService.addActivity((this.motorStatus === "ON" ? "OFF" : "ON"), system);
    } else {
      this.userActivityService.addActivity(this.motorStatus === "ON" ? "OFF" : "ON");
    }
  }

  loadLastAction() {
    this.firebaseService.getRealTimeData<LastAction>("lastAction").subscribe(lastAction => {
      this.userService.collectUsers().subscribe(users => {
        let filtered = users.filter(user => user.email === lastAction.user);
        if (filtered && filtered.length > 0) {
          lastAction.user = filtered[0].name;
          this.lastAction = lastAction;
        }
      })
    })
  }

  collectMotorStatus(collectWaterLevel?: boolean) {
    this.firebaseService.getRealTimeData<string>("/status").subscribe(data => {
      this.motorStatus = data;
      if (collectWaterLevel) {
        this.collectWaterLevel()
      }
    })
  }

  showTemperatureChart() {
    this.chartShowing = 3;
    if (this.currentWeather && this.currentWeather.hourly && this.currentWeather.hourly.temperature && this.currentWeather.hourly.time) {
      this.temperatureChartData = {
        beginAtZero: false,
        data: this.currentWeather.hourly.temperature,
        label: "Temperature",
        labels: standardiseDate(this.currentWeather.hourly.time)
      }
    }
  }

  showHumidityChart() {
    this.chartShowing = 4;
    if (this.currentWeather && this.currentWeather.hourly && this.currentWeather.hourly.relativehumidity_2m) {
      this.humidityChartData = {
        beginAtZero: false,
        data: this.currentWeather.hourly.relativehumidity_2m,
        label: "Humidity",
        labels: standardiseDate(this.currentWeather.hourly.time)
      }
    }
  }


  showHealthchart(dates: string[], freeHeap: number[]) {
    if (dates && freeHeap) {
      this.healthChartData = {
        beginAtZero: false,
        data: freeHeap,
        label: "Free heap",
        labels: dates
      }
    }
  }

  showMotorChart() {
    this.chartShowing = 2;
    let minutes = this.motorLogs.map(log => log.totalMinutes!)
    let dates = this.motorLogs.map(log => log.date)
    this.motorChartData = {
      beginAtZero: false,
      data: minutes,
      label: "Watering minutes",
      labels: dates
    }
  }


}