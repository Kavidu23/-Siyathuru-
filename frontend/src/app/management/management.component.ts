import { Component } from '@angular/core';
import { ReviewComponent } from '../review/review.component';
import { EventComponent } from '../event/event.component';
import { AlertComponent } from '../alert/alert.component';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [
    ReviewComponent,
    EventComponent,
    AlertComponent,
    FooterComponent,
    NavbarComponent,
  ],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css',
})
export class ManagementComponent {}
