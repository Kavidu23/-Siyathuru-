import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { LanguageSelectComponent } from '../language-select/language-select.component';
import { ModalService } from '../modal.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, LanguageSelectComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private modalService: ModalService) { }

  openLoginModal() {
    this.modalService.openLogin();
  }

}
