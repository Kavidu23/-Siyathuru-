import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-pro',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './pro.component.html',
  styleUrl: './pro.component.css',
})
export class ProComponent {}
