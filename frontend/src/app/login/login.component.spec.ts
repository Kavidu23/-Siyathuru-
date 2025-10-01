import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ModalService } from '../modal.service';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';

// 1. Mock the ModalService
class MockModalService {
  private subject = new BehaviorSubject<boolean>(false);
  loginVisible$ = this.subject.asObservable();

  closeLogin = jasmine.createSpy('closeLogin');
  openSignup = jasmine.createSpy('openSignup'); // ✅ Added so we can test it

  emit(value: boolean) {
    this.subject.next(value);
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let modalService: MockModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Since LoginComponent is standalone, import it instead of declaring
      imports: [LoginComponent, CommonModule],
      providers: [{ provide: ModalService, useClass: MockModalService }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService) as unknown as MockModalService;

    fixture.detectChanges(); // triggers ngOnInit
  });

  // --- Core Tests ---

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe from ModalService on ngOnDestroy', () => {
    const unsubscribeSpy = spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });

  it('should set isVisible based on the ModalService stream', () => {
    expect(component.isVisible).toBe(false);

    modalService.emit(true);

    expect(component.isVisible).toBe(true);
  });

  it('should call closeLogin() on the ModalService when closeLogin() is called', () => {
    expect(modalService.closeLogin).not.toHaveBeenCalled();
    component.closeLogin();
    expect(modalService.closeLogin).toHaveBeenCalledTimes(1);
  });

  it('should call openSignup() and closeLogin() on the ModalService when OpenSignup() is called', () => {
    expect(modalService.openSignup).not.toHaveBeenCalled();
    expect(modalService.closeLogin).not.toHaveBeenCalled();

    component.OpenSignup();

    expect(modalService.openSignup).toHaveBeenCalledTimes(1);
    expect(modalService.closeLogin).toHaveBeenCalledTimes(1);
  });
});
