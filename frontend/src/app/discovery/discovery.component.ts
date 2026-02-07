import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from '../footer/footer.component';
import { CommunityService } from '../services/community.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-discovery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    FooterComponent,
    RouterLink,
  ],
  templateUrl: './discovery.component.html',
  styleUrls: ['./discovery.component.css'],
})
export class DiscoveryComponent implements AfterViewInit {
  selectedType = 'all';
  selectedJoinType = 'all';
  searchQuery = '';

  districts: { district: string; lat: number; lng: number }[] = [];
  locationSuggestions: { district: string; lat: number; lng: number }[] = [];

  // 👉 This will hold SELECTED DISTRICT COORDS
  userCoords: { lat: number; lon: number } | null = null;

  communities: any[] = [];
  uniqueTypes: string[] = [];
  filteredCommunities: any[] = [];

  map!: L.Map;

  constructor(
    private http: HttpClient,
    private communityService: CommunityService,
  ) {}

  ngAfterViewInit(): void {
    this.loadDistricts();
    this.initMap();
    this.fetchCommunities();
  }

  // ----------------------------------------------------
  // MAP INIT
  // ----------------------------------------------------
  initMap() {
    this.map = L.map('map').setView([7.8731, 80.7718], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  // ----------------------------------------------------
  // LOAD COMMUNITIES
  // ----------------------------------------------------
  fetchCommunities() {
    this.communityService.getAllCommunities().subscribe({
      next: (res: any) => {
        this.communities = res.data || [];
        this.filteredCommunities = this.communities;

        // 🔥 CREATE UNIQUE TYPES
        this.uniqueTypes = [
          ...new Set(this.communities.map((c) => c.type).filter((t) => !!t)),
        ];

        this.refreshMarkers();
      },
      error: (err) => console.error('Failed to load communities', err),
    });
  }

  // ----------------------------------------------------
  // LOAD DISTRICTS JSON
  // ----------------------------------------------------
  loadDistricts() {
    this.http.get<any[]>('districts.json').subscribe({
      next: (data: any[]) => {
        this.districts = data.map((d: any) => ({
          district: d.district,
          lat: d.lat,
          lng: d.lng,
        }));
      },
      error: (err) => console.error('Could not load districts.json', err),
    });
  }

  // ----------------------------------------------------
  // SEARCH DISTRICT NAME
  // ----------------------------------------------------
  onLocationSearch() {
    const query = this.searchQuery.trim().toLowerCase();

    if (query.length < 1) {
      this.locationSuggestions = [];
      return;
    }

    this.locationSuggestions = this.districts
      .filter((d) => d.district.toLowerCase().includes(query))
      .slice(0, 10);
  }

  // ----------------------------------------------------
  // USER SELECT DISTRICT FROM LIST
  // ----------------------------------------------------
  selectLocation(suggestion: any) {
    this.searchQuery = suggestion.district;
    this.locationSuggestions = [];

    // 👉 STORE EXACT DISTRICT COORDS
    this.userCoords = {
      lat: suggestion.lat,
      lon: suggestion.lng,
    };

    if (this.map) {
      this.map.setView([this.userCoords.lat, this.userCoords.lon], 12);
    }
  }

  // ----------------------------------------------------
  // 🔥 APPLY FILTERS – TYPE + JOIN TYPE ONLY
  // ----------------------------------------------------
  applyFilters() {
    if (!this.communities.length) return;

    this.filteredCommunities = this.communities.filter((community) => {
      // ---- 1. Type Filter ----
      const matchesType =
        this.selectedType === 'all' ||
        community.type?.toLowerCase() === this.selectedType.toLowerCase();

      // ---- 2. Join Type Filter ----
      const matchesJoinType =
        this.selectedJoinType === 'all' ||
        (community.isPrivate ? 'request' : 'free') ===
          this.selectedJoinType.toLowerCase();

      return matchesType && matchesJoinType;
    });

    this.refreshMarkers();
  }

  // ----------------------------------------------------
  // REFRESH MARKERS
  // ----------------------------------------------------
  refreshMarkers() {
    if (!this.map) return;

    // remove old markers only
    const layersToRemove: L.Layer[] = [];

    this.map.eachLayer((layer) => {
      if ((layer as any)._latlng) {
        layersToRemove.push(layer);
      }
    });

    layersToRemove.forEach((l) => this.map.removeLayer(l));

    // add new markers
    this.filteredCommunities.forEach((community) => {
      const coords = community.location?.coordinates;
      if (!coords) return;

      const lat = coords.latitude;
      const lon = coords.longitude;

      if (lat && lon) {
        L.marker([lat, lon]).addTo(this.map).bindPopup(`
            <b>${community.name}</b><br>
            ${community.type}<br>
            ${community.location?.address || ''}
          `);
      }
    });
  }

  // ----------------------------------------------------
  // RESET
  // ----------------------------------------------------
  resetFilters() {
    this.selectedType = 'all';
    this.selectedJoinType = 'all';
    this.searchQuery = '';
    this.userCoords = null;

    this.filteredCommunities = this.communities;

    if (this.map) {
      this.map.setView([7.8731, 80.7718], 7);
    }

    this.refreshMarkers();
  }
}
