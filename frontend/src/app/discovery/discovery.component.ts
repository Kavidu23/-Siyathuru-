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

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&countrycodes=LK&addressdetails=1&limit=5`;
    this.http.get<any[]>(url).subscribe(results => {
      this.locationSuggestions = results;
    });
  }

  selectLocation(suggestion: any) {
    this.searchQuery = suggestion.display_name;
    this.locationSuggestions = [];

    // Just store selected coordinates (no map movement yet)
    this.userCoords = {
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon)
    };
  }

  detectUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.userCoords = { lat: position.coords.latitude, lon: position.coords.longitude };
        this.map.setView([this.userCoords.lat, this.userCoords.lon], 12);
      });
    }
  }

  applyFilters() {
    if (!this.communities.length) return;

    const radiusKm = 50; // Adjust radius if needed
    const hasLocationFilter = !!this.userCoords;

    this.filteredCommunities = this.communities.filter(community => {
      const matchesType =
        this.selectedType === 'all' ||
        community.type?.toLowerCase() === this.selectedType.toLowerCase();

      const matchesJoinType =
        this.selectedJoinType === 'all' ||
        (community.isPrivate ? 'request' : 'free') === this.selectedJoinType.toLowerCase();

      let matchesLocation = true;

      // Only apply location filter if user selected a city
      if (hasLocationFilter && community.location?.coordinates) {
        const coords = community.location.coordinates;
        const lat = coords.latitude;
        const lon = coords.longitude;

        if (lat && lon && this.userCoords) {
          const userLat = this.userCoords.lat;
          const userLon = this.userCoords.lon;
          const distance = this.getDistanceFromLatLonInKm(
            userLat,
            userLon,
            lat,
            lon
          );
          matchesLocation = distance <= radiusKm;
        } else {
          matchesLocation = false;
        }
      }

      return matchesType && matchesJoinType && matchesLocation;
    });

    // Move map to selected area if available
    if (this.userCoords) {
      this.map.setView([this.userCoords.lat, this.userCoords.lon], 12);
    }

    // Refresh markers for filtered communities
    this.refreshMarkers();
  }

  getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  refreshMarkers() {
    if (!this.map) return;

    // Remove only existing markers
    const layersToRemove: L.Layer[] = [];
    this.map.eachLayer(layer => {
      if ((layer as any)._latlng) {
        layersToRemove.push(layer);
      }
    });
    layersToRemove.forEach(l => this.map.removeLayer(l));

    // Add markers for filtered communities
    this.filteredCommunities.forEach(community => {
      const coords = community.location?.coordinates;
      if (!coords) return;
      const lat = coords.latitude;
      const lon = coords.longitude;

      if (lat && lon) {
        L.marker([lat, lon])
          .addTo(this.map)
          .bindPopup(`<b>${community.name}</b><br>${community.type}<br>${community.location?.address || ''}`);
      }
    });
  }

  resetFilters() {
    this.selectedType = 'all';
    this.selectedJoinType = 'free';
    this.searchQuery = '';
    this.userCoords = null;
    this.filteredCommunities = this.communities;

    // Reset map view to default
    if (this.map) {
      this.map.setView([7.8731, 80.7718], 7);

      // Remove all markers (but keep tile layer)
      const layersToRemove: L.Layer[] = [];
      this.map.eachLayer(layer => {
        if ((layer as any)._latlng) {
          layersToRemove.push(layer);
        }
      });
      layersToRemove.forEach(l => this.map.removeLayer(l));
    }

    this.refreshMarkers();
  }
}
