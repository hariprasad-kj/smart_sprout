import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { ROLE_PERMISSIONS } from './def';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router, private userService: UserService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise(resolve => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          let email = user.email;
          if (!user || !email) {
            this.router.navigate(['/login']);
            resolve(false);
          } else {
            let path = route.url[0].path;
            this.userService.getUserByEmail(email).subscribe(data => {
              let approvedpaths = ROLE_PERMISSIONS.get(data.role)!
              if (approvedpaths && approvedpaths.indexOf(path) === -1) {
                this.router.navigate(['/login']);
                resolve(false)
              } else {
                resolve(true)
              }
            })
          }
        } else {
          this.router.navigate(['/login']);
          resolve(false);
        }
      });
    });
  }
}
