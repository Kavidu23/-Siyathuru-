import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from "../footer/footer.component";
import { CommunityService } from '../services/community.service';

@Component({
  selector: 'app-discovery',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, FooterComponent],
  templateUrl: './discovery.component.html',
  styleUrls: ['./discovery.component.css']
})
export class DiscoveryComponent implements AfterViewInit {
  selectedType = 'all';
  selectedJoinType = 'free';
  searchQuery = '';

  locationSuggestions: any[] = [];
  userCoords: { lat: number; lon: number } | null = null;

  communities: any[] = [];
  filteredCommunities: any[] = [];
  map!: L.Map;

  constructor(private http: HttpClient, private communityService: CommunityService) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.fetchCommunities();
    this.detectUserLocation();
  }

  initMap() {
    this.map = L.map('map').setView([7.8731, 80.7718], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  fetchCommunities() {
    this.communityService.getAllCommunities().subscribe({
      next: (res: any) => {
        this.communities = res.data || [];
        this.filteredCommunities = this.communities;
        this.refreshMarkers();
      },
      error: err => console.error('Failed to load communities', err)
    });
  }

  onLocationSearch() {
    if (this.searchQuery.length < 3) {
      this.locationSuggestions = [];
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&countrycodes=LK&addressdetails=1&limit=5&featuretype=city`;
    this.http.get<any[]>(url).subscribe(results => {
      this.locationSuggestions = results;
    });
  }

  selectLocation(suggestion: any) {
    this.searchQuery = suggestion.display_name;
    this.locationSuggestions = [];
    this.userCoords = { lat: parseFloat(suggestion.lat), lon: parseFloat(suggestion.lon) };
    this.map.setView([this.userCoords.lat, this.userCoords.lon], 12);
    this.applyFilters();
  }

  detectUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.userCoords = { lat: position.coords.latitude, lon: position.coords.longitude };
        this.map.setView([this.userCoords.lat, this.userCoords.lon], 12);
      });
    }
  }

  // Distance calculation removed since we no longer filter by distance
  applyFilters() {
    if (!this.communities.length) return;

    this.filteredCommunities = this.communities.filter(community => {
      const matchesType = this.selectedType === 'all' || community.type?.toLowerCase() === this.selectedType.toLowerCase();
      const matchesJoinType =
        !this.selectedJoinType || this.selectedJoinType === 'all' ||
        (community.isPrivate ? 'request' : 'free') === this.selectedJoinType.toLowerCase();
      const matchesLocation =
        !this.searchQuery || community.location?.address?.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesType && matchesJoinType && matchesLocation;
    });

    this.refreshMarkers();
  }


  refreshMarkers() {
    if (!this.map) return;

    // Remove existing markers
    this.map.eachLayer(layer => {
      if ((layer as any)._latlng) this.map.removeLayer(layer);
    });

    // Re-add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.filteredCommunities.forEach(community => {
      const lat = community.location?.coordinates?.latitude;
      const lon = community.location?.coordinates?.longitude;
      if (lat && lon) {
        L.marker([lat, lon])
          .addTo(this.map)
          .bindPopup(`<b>${community.name}</b><br>${community.type}<br>${community.location?.address || ''}`);
      }
    });
  }
}
