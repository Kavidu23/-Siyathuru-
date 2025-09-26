import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-language-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-select.component.html',
  styleUrl: './language-select.component.css'
})
export class LanguageSelectComponent {

  isModalOpen = false;
  selectedLanguage = 'English';

  openLangModal() {
    console.log("Opening language modal");
    this.isModalOpen = true;
  }

  closeLangModal() {
    console.log("Closing language modal");
    this.isModalOpen = false;
  }
  setLanguage(lang: string) {
    this.selectedLanguage = lang;
    this.closeLangModal();
    // Optional: emit event to parent (navbar) if needed
    // this.languageChange.emit(lang);
  }


}
