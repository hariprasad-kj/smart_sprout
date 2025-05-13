import { Component, OnInit } from '@angular/core';
import { faChartLine, faCog, faMapMarkerAlt, faPowerOff, faTachometerAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { Auth } from '@angular/fire/auth';
import { NavigationEnd, Router, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs';
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

  faPowerOff = faPowerOff;
  faCog = faCog;
  faUser = faUser;
  faTachometer = faTachometerAlt;
  faMapMarkerAlt = faMapMarkerAlt;
  faChartLine = faChartLine;

  constructor(private auth: Auth,
    private router: Router,
    private dataService: DataShareService
  ) { }

  ngOnInit() {
    this.dataService.role$.subscribe(role => this.role = role)
    this.router.events
      .pipe(filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl = event.urlAfterRedirects;
        this.showSidebar = this.currentUrl !== '/login'
      });
    this.loggedIn = this.auth
    this.name = sessionStorage.getItem("name")
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
