import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from '../map.service';
import { LocationData, MapData, MapHeight } from '../def';
import { UserLocationService } from '../user-location.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

  @Output() locationSetEvent = new EventEmitter<MapData>();
  @Input("height") height: MapHeight = MapHeight.SMALL;
  @Input("userLocation") location!: LocationData;

  map!: L.Map;
  selectedLat: number | null = null;
  selectedLng: number | null = null;
  marker!: L.Marker;
  place!: string;

  constructor(private mapService: MapService, private userLocationService: UserLocationService) { }
  ngOnInit(): void {
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    L.Marker.prototype.options.icon = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
  }

  setlocation(location: LocationData) {
    this.location = location;
    if (!this.location.lat) this.location.lat = 10.5222;
    if (!this.location.long) this.location.long = 76.2110;
    if (!this.location.zoom) this.location.zoom = 9;
    if (this.location.place) this.place = this.location.place;
  }

  ngAfterViewInit(): void {
    this.userLocationService.getUserLocationInfo().subscribe(data => {
      if (data) {
        if (data.location) {
          this.setlocation(data.location)
          if (data.location.place) {
            this.place = this.location.place
          }
        } else {
          this.setlocation({ email: '', lat: 10.5222, long: 76.2110, place: "", timestamp: 0, zoom: 13 })
        }
      }
      this.map = L.map('map').setView([this.location.lat, this.location.long], this.location.zoom);
      if (this.location.lat && this.location.long && this.location.place) {
        this.marker = L.marker([this.location.lat, this.location.long])
          .addTo(this.map)
          .bindPopup(`${this.place}`)
          .openPopup();
      }
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.selectedLat = e.latlng.lat;
        this.selectedLng = e.latlng.lng;

        if (this.marker) {
          this.map.removeLayer(this.marker);
        }

        this.mapService.getLatLongDetails(this.selectedLat, this.selectedLng).subscribe(data => {
          this.place = data.display_name
          if (this.selectedLat && this.selectedLng)
            this.marker = L.marker([this.selectedLat, this.selectedLng])
              .addTo(this.map)
              .bindPopup(`${this.place}`)
              .openPopup();
          this.locationSetEvent.emit({ zoom: this.map.getZoom(), location: data })
        })
      });

    })
  }

}
