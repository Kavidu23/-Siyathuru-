import { Component } from '@angular/core';
import { ReviewComponent } from '../review/review.component';
import { EventComponent } from '../event/event.component';
import { AlertComponent } from '../alert/alert.component';
import { FooterComponent } from '../footer/footer.component';
import { AddImageComponent } from '../add-image/add-image.component';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [
    ReviewComponent,
    EventComponent,
    AlertComponent,
    FooterComponent,
    AddImageComponent,
    CommonModule,
  ],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css',
})
export class ManagementComponent implements OnInit {
  communityId!: string;
  activeView: 'alert' | 'review' | 'events' | 'gallery' | 'requests' | '' = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.activeView = (params.get('view') as any) || '';
    });
  }
}
