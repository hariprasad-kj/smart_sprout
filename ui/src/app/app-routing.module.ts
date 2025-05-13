import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { SettingsComponent } from './settings/settings.component';
import { ActivityComponent } from './activity/activity.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { "adminOnly": false } },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { "adminOnly": true } },
  { path: 'activity', component: ActivityComponent, canActivate: [AuthGuard], data: { "adminOnly": false } },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], data: { "adminOnly": false } },
  { path: '', redirectTo: '/login', pathMatch: 'prefix' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
