import { Component } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-community-dashboard',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './community-dashboard.component.html',
  styleUrl: './community-dashboard.component.css'
})
export class CommunityDashboardComponent {

}
