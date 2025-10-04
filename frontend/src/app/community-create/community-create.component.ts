import { Component } from '@angular/core';
import { AppComponent } from "../app.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-community-create',
  standalone: true,
  imports: [AppComponent, FooterComponent],
  templateUrl: './community-create.component.html',
  styleUrl: './community-create.component.css'
})
export class CommunityCreateComponent {

}
