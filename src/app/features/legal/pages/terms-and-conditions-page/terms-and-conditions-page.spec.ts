import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { TermsAndConditionsPage } from './terms-and-conditions-page';

describe('TermsAndConditionsPage', () => {
  let fixture: ComponentFixture<TermsAndConditionsPage>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(TermsAndConditionsPage, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(TermsAndConditionsPage);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render the page title', () => {
    expect(el.textContent).toContain('Terms and conditions');
  });

  it('should contain FAQ section', () => {
    expect(el.textContent).toContain('Frequently asked questions');
  });

  it('should contain the warning about personal information', () => {
    expect(el.textContent).toContain('Personal information');
  });
});
