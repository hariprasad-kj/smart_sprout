import { Component, OnInit } from '@angular/core';
import { WaterData } from './def';
import { Router, NavigationEnd } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { FirebaseService } from './firebase.service';
import { MotorService } from './motor.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  showNavbar = true;
  title = 'SmartSprout';
  motorStatus: string = "";
  water = "";

  constructor(private auth: Auth, private motorService: MotorService, private service: FirebaseService, private router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showNavbar = !event.url.includes('/login');
      }
    });
  }

  ngOnInit(): void {
    this.service.getRealTimeData<string>("/status").subscribe(data => {
      this.motorStatus = data;
    })
    this.service.getRealTimeData<WaterData>("/waterData").subscribe(data => {
      this.water = data.percentage;
    })
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
