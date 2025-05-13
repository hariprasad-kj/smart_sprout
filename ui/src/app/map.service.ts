import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReverseGeoData } from './def';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private http: HttpClient) { }

  getLatLongDetails(lat: number, long: number): Observable<ReverseGeoData> {
    return this.http.get<ReverseGeoData>("https://nominatim.openstreetmap.org/reverse?lon=" + long + "&lat=" + lat + "&format=json")
  }

}
