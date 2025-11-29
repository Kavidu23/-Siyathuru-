import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { ModalService } from '../modal.service';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';

// --- Mock ModalService ---
class MockModalService {
  private subject = new BehaviorSubject<boolean>(false);
  signupVisible$ = this.subject.asObservable();

  openLogin = jasmine.createSpy('openLogin');
  closeSignup = jasmine.createSpy('closeSignup');

  emit(value: boolean) {
    this.subject.next(value);
  }
}

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let modalService: MockModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent, CommonModule],
      providers: [{ provide: ModalService, useClass: MockModalService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService) as unknown as MockModalService;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have isVisible default to false', () => {
    expect(component.isVisible).toBeFalse();
  });

  it('should open login modal and close signup modal when openLogin() is called', () => {
    component.openLogin();
    expect(modalService.openLogin).toHaveBeenCalledTimes(1);
    expect(modalService.closeSignup).toHaveBeenCalledTimes(1);
  });

  it('should close signup modal when closeSignup() is called', () => {
    component.closeSignup();
    expect(modalService.closeSignup).toHaveBeenCalledTimes(1);
  });

  it('should update isVisible when signupVisible$ emits true', () => {
    expect(component.isVisible).toBeFalse();
    modalService.emit(true);
    expect(component.isVisible).toBeTrue();
  });

  it('should unsubscribe from subscription on destroy', () => {
    const unsubscribeSpy = spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });
});
