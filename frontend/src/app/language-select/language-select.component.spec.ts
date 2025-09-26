import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LanguageSelectComponent } from './language-select.component';

describe('LanguageSelectComponent', () => {
  let component: LanguageSelectComponent;
  let fixture: ComponentFixture<LanguageSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSelectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal when openLangModal is called', () => {
    component.openLangModal();
    expect(component.isModalOpen).toBeTrue();
  });

  it('should close modal when closeLangModal is called', () => {
    component.openLangModal();
    component.closeLangModal();
    expect(component.isModalOpen).toBeFalse();
  });

  it('should set selected language and close modal', () => {
    component.openLangModal();
    component.setLanguage('සිංහල');
    expect(component.selectedLanguage).toBe('සිංහල');
    expect(component.isModalOpen).toBeFalse();
  });

  it('should update template when language is selected', () => {
    component.setLanguage('සිංහල');
    fixture.detectChanges();
    const langText = fixture.debugElement.query(By.css('.lang-item')).nativeElement
      .textContent;
    expect(langText).toContain('සිංහල');
  });

  it('should show modal in DOM when isModalOpen = true', () => {
    component.openLangModal();
    fixture.detectChanges();
    const modal = fixture.debugElement.query(By.css('.modal'));
    expect(modal).toBeTruthy();
  });

  it('should hide modal in DOM when isModalOpen = false', () => {
    component.closeLangModal();
    fixture.detectChanges();
    const modal = fixture.debugElement.query(By.css('.modal'));
    expect(modal).toBeNull();
  });
});
