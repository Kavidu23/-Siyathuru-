import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from '../modal.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

  isVisible = false;
  subscription!: Subscription;

  constructor(private modalService: ModalService) { }

  // switch to login modal
  openLogin() {
    this.modalService.openLogin();
    this.modalService.closeSignup(); // ✅ close signup properly
  }

  ngOnInit() {
    this.subscription = this.modalService.signupVisible$.subscribe(visible => {
      this.isVisible = visible;
    });
  }

  closeSignup() {
    this.modalService.closeSignup(); // ✅ fixed
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
