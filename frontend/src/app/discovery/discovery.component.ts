import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-discovery',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, FooterComponent],
  templateUrl: './discovery.component.html',
  styleUrls: ['./discovery.component.css']
})
export class DiscoveryComponent implements AfterViewInit {
  selectedDistance = 10;
  selectedType = 'all';
  selectedJoinType = 'free';

  searchQuery = '';
  locationSuggestions: any[] = [];

  communities = [
    { name: 'Youth Leadership Group', location: 'Colombo', type: 'youth', joinType: 'Free', image: 'https://source.unsplash.com/400x200/?community,people', lat: 6.9271, lng: 79.8612 },
    { name: 'Women Empowerment Hub', location: 'Kandy', type: 'women', joinType: 'On Request', image: 'https://source.unsplash.com/400x200/?teamwork,group', lat: 7.2906, lng: 80.6337 }
  ];

  filteredCommunities = [...this.communities];
  map!: L.Map;

  constructor(private http: HttpClient) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.detectUserLocation();
  }

  initMap() {
    this.map = L.map('map').setView([7.8731, 80.7718], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.refreshMarkers();

    this.map.whenReady(() => {
      setTimeout(() => this.map.invalidateSize(), 500);
    });
  }

  applyFilters() {
    this.filteredCommunities = this.communities.filter(community => {
      const matchesType = this.selectedType === 'all' || community.type === this.selectedType;
      const matchesJoinType = this.selectedJoinType === 'all' || community.joinType.toLowerCase() === this.selectedJoinType.toLowerCase();
      return matchesType && matchesJoinType;
    });

    this.refreshMarkers();
  }

  refreshMarkers() {
    if (!this.map) return;
    this.map.eachLayer(layer => {
      if ((layer as any)._latlng) this.map.removeLayer(layer);
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.filteredCommunities.forEach(community => {
      L.marker([community.lat, community.lng])
        .addTo(this.map)
        .bindPopup(`<b>${community.name}</b><br>${community.location}`);
    });
  }

  onLocationSearch() {
    if (this.searchQuery.length < 3) {
      this.locationSuggestions = [];
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&countrycodes=LK&addressdetails=1&limit=5`;
    this.http.get<any[]>(url).subscribe(results => {
      this.locationSuggestions = results;
    });
  }

  selectLocation(suggestion: any) {
    this.searchQuery = suggestion.display_name;
    this.locationSuggestions = [];
    this.map.setView([suggestion.lat, suggestion.lon], 12);
  }

  detectUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.map.setView([position.coords.latitude, position.coords.longitude], 12);
      });
    }
  }
}
