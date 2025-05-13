import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router, private userService: UserService) { }

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise(resolve => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          if (route.data['adminOnly']) {
            this.userService.getUserByEmail(user.email!).subscribe(data => {
              if (data && data.role && data.role === 'admin') {
                resolve(true)
              } else {
                resolve(false)
              }
            })
          } else {
            resolve(true);
          }
        } else {
          this.router.navigate(['/login']);
          resolve(false);
        }
      });
    });
  }
}
