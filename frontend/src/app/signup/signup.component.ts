import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from '../modal.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  isVisible = false;
  subscription!: Subscription;

  constructor(private modalService: ModalService, private userSerivce: UserService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      memberType: ['', Validators.required]
    });
  }



  //create account



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
