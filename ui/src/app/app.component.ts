import { Component, OnInit } from '@angular/core';
import { WaterData } from './def';
import { Router, NavigationEnd } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { FirebaseService } from './firebase.service';
import { MotorService } from './motor.service';
import { UserService } from './user.service';
import { DataShareService } from './data-share.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'SmartSprout';
  motorStatus: string = "";
  water = "";
  showMargin = false;

  constructor(private auth: Auth,
    private motorService: MotorService,
    private service: FirebaseService,
    private router: Router,
    private userService: UserService,
    private dataService: DataShareService
  ) {
  }

  ngOnInit(): void {
    this.dataService.url$.subscribe(data => {
      let view = this.getViewType();
      if (view !== 'mobile') {
        this.showMargin = data !== 'login'
      } else {
        this.showMargin = false;
      }
    })
    this.service.getRealTimeData<string>("/status").subscribe(data => {
      this.motorStatus = data;
    })
    this.service.getRealTimeData<WaterData>("/waterData").subscribe(data => {
      this.water = data.percentage;
    })
    console.log("calling")
    this.userService.getLoggedInUserDetails().subscribe(data => console.log(data))
  }

  getViewType(): string {
    let isMobile = window.innerWidth <= 768; // You can adjust the threshold
    return isMobile ? 'mobile' : 'desktop';
  }

  logout() {
    signOut(this.auth)
      .then(() => this.router.navigate(['/login']))
      .catch(error => console.error('Logout failed:', error));
  }

  changeMotorStatus() {
    let status = this.motorStatus === "ON" ? "OFF" : "ON"
    this.motorService.updateMotorStatus(status)
      .then(() => {
        this.service.getRealTimeData<string>("/status").subscribe(data => {
          this.motorStatus = data;
        })
      })
      .catch(error => console.error('Error updating data:', error));
  }

  closeSidebar() {
    document.body.classList.remove('sidebar-open');
  }

}
