import { Component } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { RouterLink } from "@angular/router";
import { ChartDashboardComponent } from '../charts/charts.component';

@Component({
  selector: 'app-community-dashboard',
  standalone: true,
  imports: [FooterComponent, RouterLink, ChartDashboardComponent],
  templateUrl: './community-dashboard.component.html',
  styleUrl: './community-dashboard.component.css'
})
export class CommunityDashboardComponent {

}
