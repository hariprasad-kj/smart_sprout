import { DatePipe } from '@angular/common';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
    faSun,
    faCloudSunRain,
    faCloudRain,
    faCloudShowersHeavy,
    faPooStorm
} from '@fortawesome/free-solid-svg-icons';

export interface ActivityLog {
    user: string;
    action: string;
    timestamp: number;
    date?: string;
    className?: string;
}

export interface DateHistoryMap {
    date: string;
    minutes: number;
}

export interface ActivityLogMap {
    date: string;
    logs: ActivityLog[];
}

export interface MotorLog {
    date: string;
    logs: Motorlogs[];
    totalSeconds?: number;
    totalMinutes?: number;
}

export interface Motorlogs {
    on: string;
    off: string;
    turnedOnSeconds?: number;
}

export interface DeviceLogEntry {
    on: string;
    off: string;
}

export interface DeviceLogById {
    [entryId: string]: DeviceLogEntry;
}

export interface DeviceLogByDate {
    [date: string]: DeviceLogById;
}

export interface MotorOnOff {
    date: string;
    seconds: number;
    minutes: number;
}

export interface LastAction {
    user: string;
    timestamp: number;
}

export interface User {
    email: string;
    name: string;
    role: string;
}

export interface UserLocation {
    user: User | null;
    location: LocationData | null;
}

export interface HealthMetrics {
    cpuFreqMHz: number;
    freeHeap: number;
    wifiRSSI: number;
    timestamp: string;
}

export interface MapData {
    zoom: number;
    location: ReverseGeoData;
}

export interface LocationData {
    email: string,
    lat: number,
    long: number,
    place: string,
    zoom: number,
    timestamp: number
}

export enum MapHeight {
    SMALL = 250,
    MEDIUM = 450,
    LARGE = 600
}

export interface ReverseGeoData {
    "place_id": number,
    "licence": string,
    "osm_type": string,
    "osm_id": number,
    "lat": string,
    "lon": string,
    "class": string,
    "type": string,
    "place_rank": number,
    "importance": number,
    "addresstype": string,
    "name": string,
    "display_name": string,
    "address": {
        "amenity": string,
        "road": string,
        "village": string,
        "county": string,
        "state_district": string,
        "state": string,
        "ISO3166-2-lvl4": string,
        "postcode": string,
        "country": string,
        "country_code": string
    },
    "boundingbox": string[]

}

export interface WaterData {
    level: string;
    percentage: string;
    volume: string;
}

// Weather related

export interface Weather {
    latitude: number,
    longitude: number,
    generationtime_ms: number,
    utc_offset_seconds: number,
    timezone: string,
    timezone_abbreviation: string,
    elevation: number,
    current_weather_units: CurrentWeatherUnits,
    current_weather: CurrentWeather,
    hourly_units: HourlyUnits,
    hourly: Hourly
}

export interface CurrentWeatherUnits {
    time: string,
    interval: string,
    temperature: string,
    windspeed: string,
    winddirection: string,
    is_day: string,
    weathercode: string
}

export interface CurrentWeather {
    time: string,
    interval: number,
    temperature: number,
    windspeed: number,
    winddirection: number,
    is_day: number,
    weathercode: number
}

export interface HourlyUnits {
    time: string,
    relativehumidity_2m: string,
    precipitation: string
}

export interface Hourly {
    time: string[],
    relativehumidity_2m: number[],
    precipitation: number[],
    temperature: number[]
}

export interface HourlyMap {
    time: string,
    relativehumidity_2m: number,
    precipitation: number,
    timeUnit?: string,
    relativehumidity_2mUnit?: string,
    precipitationUnit?: string
}

export enum RainMessage {
    None = 'No rain',
    Light = 'Light rain',
    Moderate = 'Moderate rain',
    Heavy = 'Heavy rain',
    VeryHeavy = 'Very heavy rain'
}

export const RainIcon = new Map<RainMessage, IconDefinition>([
    [RainMessage.None, faSun],
    [RainMessage.Light, faCloudSunRain],
    [RainMessage.Moderate, faCloudRain],
    [RainMessage.Heavy, faCloudShowersHeavy],
    [RainMessage.VeryHeavy, faPooStorm]
]);

export function getRainIcon(message: RainMessage): IconDefinition {
    return RainIcon.get(message)!;
}

export const FIREBASE_URL: string = "https://splash-75d85-default-rtdb.asia-southeast1.firebasedatabase.app"
export const WEATHER_URL: string = "https://api.open-meteo.com/v1/forecast"

export interface ChartDef {
    beginAtZero: boolean;
    label: string;
    data: number[];
    labels: string[];
}

export enum DATE_STANDARDIZED_FORMAT {
    DATE = "DATE", TIME = "TIME"
}

export function standardiseDate(dates: Date[] | string[] | number[], format?: DATE_STANDARDIZED_FORMAT) {
    let outputs: string[] = [];
    if (format) {
        if (format === DATE_STANDARDIZED_FORMAT.DATE) {
            dates.map(date => outputs.push(new DatePipe('en').transform(date, 'MMM dd, yyyy')!))
        } else {
            dates.map(date => outputs.push(new DatePipe('en').transform(date, 'hh:mm:ss')!))
        }
    } else {
        dates.map(date => outputs.push(new DatePipe('en').transform(date, 'MMM dd, yyyy hh:mm:ss')!))
    }
    return outputs;
}

export function standardiseDateString(date: Date | string | number, format?: DATE_STANDARDIZED_FORMAT) {
    if (format) {
        if (format === DATE_STANDARDIZED_FORMAT.DATE) {
            return new DatePipe('en').transform(date, 'MMM dd, yyyy')!
        } else {
            return new DatePipe('en').transform(date, 'hh:mm:ss')!
        }
    }
    return new DatePipe('en').transform(date, 'MMM dd, yyyy hh:mm:ss')!
}

export function timeDiff(time1: string, time2: string): number {
    let split1 = time1.split(":")
    let split2 = time2.split(":")
    let seconds1 = (+split1[0]) * 3600 + (+split1[1]) * 60 + (+split1[2]) | 0
    let seconds2 = (+split2[0]) * 3600 + (+split2[1]) * 60 + (+split2[2]) | 0
    let diff = (seconds2 - seconds1) | 0
    return diff
}

export interface ToastDef {
    title: string;
    subTitle?: string;
    message: string;
    type?: ToastType;
}

export enum ToastType {
    DANGER = 'bg-danger',
    SUCCESS = 'bg-success',
    WARNING = 'bg-warning'
}