import { Component, OnInit } from '@angular/core';
import { MapData, MapHeight, User } from '../def';
import { UserLocationService } from '../user-location.service';
import { DataShareService } from '../data-share.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  mapHeight: MapHeight = MapHeight.MEDIUM
  user!: User;

  constructor(private userLocationService: UserLocationService, private dataService: DataShareService, private userService: UserService) { }
  ngOnInit(): void {
    this.dataService.notifyUrlChange('profile');
    this.userService.getLoggedInUserDetails().subscribe(data => {
      if (data) this.user = data;
    })
  }

  setUserLocation(mapData: MapData) {
    this.userLocationService.setUserLocation(mapData).then(() =>
      this.dataService.showSuccessToast("Location updated successfully", "User location has been updated successfully!")
    )
  }

}
