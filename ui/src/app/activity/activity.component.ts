import { Component, OnInit } from '@angular/core';
import { ActivityLog, ActivityLogMap, DATE_STANDARDIZED_FORMAT, standardiseDateString, User } from '../def';
import { DatePipe } from '@angular/common';
import { faChevronCircleLeft, faClock } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../user.service';
import { UserActivityService } from '../user-activity.service';
import { DataShareService } from '../data-share.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {

  faChevronCircleLeft = faChevronCircleLeft;
  logs: ActivityLog[] = [];
  map: ActivityLogMap[] = [];
  dates: Set<string> = new Set();
  users: User[] = [];

  faClock = faClock;

  constructor(private userService: UserService, private userActivityService: UserActivityService, private dataService: DataShareService) { }

  ngOnInit(): void {
    this.dataService.notifyUrlChange('activity');
    this.loadUsers();
    this.userActivityService.loadLogs();
    this.userActivityService.logs$.subscribe(logs => {
      this.logs = logs;
      this.logs.map(log => {
        log.date = standardiseDateString(log.timestamp, DATE_STANDARDIZED_FORMAT.DATE)
      })
      this.logs.forEach(log => this.dates.add(standardiseDateString(log.timestamp, DATE_STANDARDIZED_FORMAT.DATE)))
      this.loadLogs();
    });
  }

  loadUsers() {
    this.userService.collectUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  loadLogs() {
    this.logs.forEach(log => {
      this.users.forEach(user => {
        if (user.email === log.user) {
          log.user = user.name
        }
      })
    });
    this.dates.forEach(date => {
      let logsToUse = this.logs.filter(log => log.date == date)
      logsToUse.forEach((item, i) => {
        if (i > 1) {
          item.className = "collapsed"
        }
      })
      this.map.push({ date: date, logs: logsToUse })
    })
    this.map.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  toggleLog(group: ActivityLogMap) {
    let classes = group.logs.map(item => item.className)
    if (classes.indexOf("collapsed") == -1) {
      group.logs.forEach((item, i) => {
        if (i > 1) {
          item.className = "collapsed"
        }
      })
    } else {
      group.logs.forEach(item => item.className = "")
    }
  }


}
