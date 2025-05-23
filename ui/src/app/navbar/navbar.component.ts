import { Component, OnInit } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { faCog, faMicrochip, faPowerOff, faTint } from '@fortawesome/free-solid-svg-icons';
import { HealthMetrics } from '../def';
import { FirebaseService } from '../firebase.service';
import { HealthService } from '../health.service';
import { UserService } from '../user.service';
import { DataShareService } from '../data-share.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  name: string | null = '';
  showNavBar = false;
  loggedIn!: Auth;
  isChipAlive = false;

  faPowerOff = faPowerOff;
  faCog = faCog;
  faTint = faTint;
  faMicrochip = faMicrochip;

  constructor(private auth: Auth,
    private router: Router,
    private fireBaseService: FirebaseService,
    private healthService: HealthService,
    private userService: UserService,
    private dataService: DataShareService
  ) {
  }

  toggleSidebar() {
    const body = document.body;
    if (body.classList.contains('sidebar-open')) {
      body.classList.remove('sidebar-open');
      body.classList.add('sidebar-collapse');
    } else {
      body.classList.add('sidebar-open');
      body.classList.remove('sidebar-collapse');
    }
  }

  ngOnInit() {
    this.dataService.url$.subscribe(data => this.showNavBar = data !== 'login')
    setInterval(() => {
      this.healthService.getLastHealthData().subscribe(data => {
        this.fireBaseService.getRealTimeData<number>("/healthCheckDelay").subscribe(delay => {
          if (data) {
            let content = Object.values(data)[0] as HealthMetrics;
            let lastDate = new Date(content.timestamp).getTime();
            if (lastDate) {
              this.isChipAlive = (Math.abs(Date.now() - lastDate) <= (delay * 1000))
              this.dataService.notifyChipCondition(this.isChipAlive);
            }
          }
        })
      })
    }, 10000)
    this.loggedIn = this.auth
  }

  logout() {
    signOut(this.auth)
      .then(() => {
        this.userService.clearUserCache()
        this.router.navigate(['/login'])
      })
      .catch((err) => console.error('Logout error:', err));
  }

}
