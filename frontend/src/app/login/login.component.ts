import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from '../modal.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule],
  standalone: true

})
export class LoginComponent implements OnInit, OnDestroy {

  isVisible = false;
  subscription!: Subscription;

  constructor(private modalService: ModalService) { }

  // switch to signup modal
  OpenSignup() {
    this.modalService.openSignup();
    this.modalService.closeLogin(); // close login properly
  }

  ngOnInit() {
    this.subscription = this.modalService.loginVisible$.subscribe(visible => {
      this.isVisible = visible;
    });
  }

  closeLogin() {
    this.modalService.closeLogin();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
