import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Weather, WEATHER_URL } from './def';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) { }

  getCurrentWeather(lat: number, long: number): Observable<Weather> {
    return this.http.get<Weather>(WEATHER_URL + "?latitude=" + lat + "&longitude=" + long + "&current_weather=true&hourly=relativehumidity_2m,precipitation,temperature")
  }

}
