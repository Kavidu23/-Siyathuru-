import { Component } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-community-dashboard',
  standalone: true,
  imports: [FooterComponent, RouterLink],
  templateUrl: './community-dashboard.component.html',
  styleUrl: './community-dashboard.component.css'
})
export class CommunityDashboardComponent {

}
