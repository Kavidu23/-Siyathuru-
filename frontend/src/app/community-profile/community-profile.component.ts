import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from "../footer/footer.component";
import { CommunityService } from '../services/community.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-community-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, FooterComponent],
  templateUrl: './community-profile.component.html',
  styleUrls: ['./community-profile.component.css']
})
export class CommunityProfileComponent implements AfterViewInit, OnInit {

  map!: L.Map;
  //hold the community
  community: any = null; // to store fetched community
  selectedImage: string | null = null;

  constructor(private http: HttpClient, private communityService: CommunityService, private route: ActivatedRoute) { }

  ngOnInit() {
    // Fetch the "id" from the route parameter
    const communityId = this.route.snapshot.paramMap.get('id');

    if (!communityId) {
      alert('Community can not be found');
      return;
    }

    this.communityService.getCommunityById(communityId).subscribe({

      next: (res) => {
        this.community = res.data;
      },

      error: (err) => {
        console.error('Failed to fetch community:', err);
      }

    });

  }

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



  openImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = null;
  }

}
