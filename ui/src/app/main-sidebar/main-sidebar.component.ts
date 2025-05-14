import { Component, OnInit } from '@angular/core';
import { faChartLine, faCog, faMapMarkerAlt, faPowerOff, faTachometerAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { faIdCard } from '@fortawesome/free-regular-svg-icons';
import { User } from '../def';
import { UserService } from '../user.service';
import { DataShareService } from '../data-share.service';

@Component({
  selector: 'app-main-sidebar',
  templateUrl: './main-sidebar.component.html',
  styleUrls: ['./main-sidebar.component.css']
})
export class MainSidebarComponent implements OnInit {
  name: string | null = '';
  loggedIn!: Auth;
  currentUrl = "";
  showSidebar = false;
  role: string = "";
  user!: User

  faPowerOff = faPowerOff;
  faCog = faCog;
  faUser = faUser;
  faTachometer = faTachometerAlt;
  faMapMarkerAlt = faMapMarkerAlt;
  faChartLine = faChartLine;
  faIdCard = faIdCard;

  constructor(private auth: Auth,
    private router: Router,
    private dataService: DataShareService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loggedIn = this.auth
    this.dataService.url$.subscribe(data => {
      this.showSidebar = (data !== 'login')
      if (this.showSidebar && this.loggedIn && this.loggedIn.currentUser && this.loggedIn.currentUser.email) {
        this.userService.getUserByEmail(this.loggedIn.currentUser.email).subscribe(data => {
          this.name = data.name
          this.role = data.role
        })
      }
    })
  }

  toggleSidebar() {
    const body = document.body;
    if (body.className === 'sidebar-mini') {
      body.className = 'sidebar-mini sidebar-open'
    } else {
      body.className = 'sidebar-mini'
    }
  }

  menuClicked(url: string) {
    this.toggleSidebar();
    this.router.navigateByUrl(url);
  }

}
