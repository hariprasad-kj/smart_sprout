import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '../def';
import { UserService } from '../user.service';
import { DataShareService } from '../data-share.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  users: User[] = []

  constructor(private auth: Auth,
    private router: Router,
    private service: UserService,
    private dataService: DataShareService
  ) { }

  login() {
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(data => {
        if (data.user.email) {
          this.service.collectUsers().subscribe({
            next: (users) => {
              this.users = users;
              let filtered = this.users.filter(user => user.email === data.user.email);
              if (filtered && filtered.length > 0) {
                sessionStorage.setItem("name", filtered[0].name)
                sessionStorage.setItem("email", filtered[0].email)
                this.dataService.notifyRole(filtered[0].role)
              }
            },
            error: (err) => {
              console.error('Failed to load users:', err);
            }
          });

          this.router.navigateByUrl('/dashboard')
        }
      })
      .catch(err => this.errorMessage = err.message);
  }
}