// navbar.component.spec.ts (Corrected)

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { ModalService } from '../modal.service';
import { RouterLink, ActivatedRoute } from '@angular/router'; // Import ActivatedRoute

// 1. Mock the ActivatedRoute
// This is the key fix for the NullInjectorError.
// We use simple placeholder values since the component doesn't actually interact with the route data.
class MockActivatedRoute {
    snapshot = {};
    params = {};
}

// 2. Mock the Modal Service
class MockModalService {
    openLogin = jasmine.createSpy('openLogin');
    openSignup = jasmine.createSpy('openSignup');
}

// 3. Mock the Dependency Component
import { Component } from '@angular/core';
@Component({ selector: 'app-language-select', standalone: true, template: '' })
class MockLanguageSelectComponent { }


describe('NavbarComponent', () => {
    let component: NavbarComponent;
    let fixture: ComponentFixture<NavbarComponent>;
    let modalService: MockModalService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            // We list the component being tested in imports for standalone setup
            imports: [
                NavbarComponent,
                RouterLink
            ],
            // FIX: Provide the required services for RouterLink to function
            providers: [
                { provide: ModalService, useClass: MockModalService },
                { provide: ActivatedRoute, useClass: MockActivatedRoute } // <--- THE FIX
            ]
        })
            // 4. Override to use the Mock Dependency Component
            .overrideComponent(NavbarComponent, {
                set: {
                    imports: [RouterLink, MockLanguageSelectComponent]
                }
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        modalService = TestBed.inject(ModalService) as unknown as MockModalService;
        fixture.detectChanges();
    });

    // --- The requested simple test ---

    it('should call openLogin() on ModalService when openLoginModal() is called', () => {
        // ARRANGE: Ensure the spy hasn't been called yet
        expect(modalService.openLogin).not.toHaveBeenCalled();

        // ACT: Call the component method
        component.openLoginModal();

        // ASSERT: Check if the service method was called exactly once
        expect(modalService.openLogin).toHaveBeenCalledTimes(1);
    });

    it("should call openSignup() on ModalService when openSignupModal() is called", () => {
        // ARRANGE: Ensure the spy hasn't been called yet
        expect(modalService.openLogin).not.toHaveBeenCalled();

        component.openSignupModal();

        // ASSERT: Check if the service method was called exactly once
        expect(modalService.openSignup).toHaveBeenCalledTimes(1);
    });

    // Now this test will pass because ActivatedRoute is provided
    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});