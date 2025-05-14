import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { environment } from '../environments/environment';

import { provideAuth, getAuth } from '@angular/fire/auth';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';
import { RelativeTimePipe } from './relative-time.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SettingsComponent } from './settings/settings.component';
import { MainSidebarComponent } from './main-sidebar/main-sidebar.component';
import { HttpClientModule } from '@angular/common/http';
import { MapComponent } from './map/map.component';
import { SplitPipe } from './split.pipe';
import { OverlayComponent } from './overlay/overlay.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivityComponent } from './activity/activity.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ProfileComponent } from './profile/profile.component';
import { ChartComponent } from './chart/chart.component';
import { UnwrapPipe } from './unwrap.pipe';
import { ToastComponent } from './toast/toast.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    NavbarComponent,
    RelativeTimePipe,
    SettingsComponent,
    MainSidebarComponent,
    MapComponent,
    SplitPipe,
    OverlayComponent,
    ActivityComponent,
    ProfileComponent,
    ChartComponent,
    UnwrapPipe,
    ToastComponent
  ],
  imports: [
    ScrollingModule,
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideDatabase(() => getDatabase()),
    provideAuth(() => getAuth()),
    FormsModule,
    FontAwesomeModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',  // 👈 This is key
      timeOut: 3000,
      progressBar: true,
      preventDuplicates: true,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
