import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-superadmin',
  standalone: true,
  imports: [CommonModule, FooterComponent, RouterLink],
  templateUrl: './superadmin.component.html',
  styleUrl: './superadmin.component.css'
})
export class SuperadminComponent {

}
