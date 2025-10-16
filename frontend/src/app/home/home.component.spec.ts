import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalService } from '../modal.service';
import { HomeComponent } from './home.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

class MockModalService {
  openLogin = jasmine.createSpy('openLogin');
  openSignup = jasmine.createSpy('openSignup');
}

let modalService: MockModalService;

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: ModalService, useClass: MockModalService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService) as unknown as MockModalService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should call openSignup() on ModalService when openSignupModal() is called", () => {
    expect(modalService.openLogin).not.toHaveBeenCalled();

    component.openSignupModal();

    expect(modalService.openSignup).toHaveBeenCalledTimes(1);
  });

  it("should call openLogin() on ModalService when openLoginModal() is called", () => {
    // Assuming you have an openLoginModal method on HomeComponent
    expect(modalService.openSignup).not.toHaveBeenCalled();

    component.openLoginModal(); // Assuming this method exists

    expect(modalService.openLogin).toHaveBeenCalledTimes(1);
  });
});