import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-community-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, FooterComponent],
  templateUrl: './community-profile.component.html',
  styleUrls: ['./community-profile.component.css']
})
export class CommunityProfileComponent implements AfterViewInit {

  map!: L.Map;

  constructor(private http: HttpClient) { }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap() {
    this.map = L.map('map').setView([7.8731, 80.7718], 7); // Sri Lanka center
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.whenReady(() => {
      setTimeout(() => this.map.invalidateSize(), 500);
    });
  }

  selectedImage: string | null = null;

  openImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = null;
  }

}
