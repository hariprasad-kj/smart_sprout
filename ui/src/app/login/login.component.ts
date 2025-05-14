import { Component, OnInit } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '../def';
import { DataShareService } from '../data-share.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  users: User[] = []

  constructor(private auth: Auth,
    private router: Router,
    private dataService: DataShareService
  ) { }
  ngOnInit(): void {
    this.dataService.notifyUrlChange("login")
  }

  login() {
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(data => {
        if (data.user.email) {
          this.router.navigateByUrl('/dashboard')
        }
      })
      .catch(err => this.errorMessage = err.message);
  }
}