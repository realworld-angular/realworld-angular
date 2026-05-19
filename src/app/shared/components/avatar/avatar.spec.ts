import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { Avatar } from './avatar';

describe('Avatar', () => {
  let fixture: ComponentFixture<Avatar>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(Avatar, {
      set: { schemas: [NO_ERRORS_SCHEMA] },
    });
    fixture = TestBed.createComponent(Avatar);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('name', '');
    await fixture.whenStable();
  });

  it('should render initials for a two-part name', async () => {
    fixture.componentRef.setInput('name', 'Foo Bar');
    await fixture.whenStable();
    expect(el.textContent).toContain('FB');
  });

  it('should render first two chars for a single-part name', async () => {
    fixture.componentRef.setInput('name', 'gerome');
    await fixture.whenStable();
    expect(el.textContent).toContain('GE');
  });

  it('should have aria-label with the name', async () => {
    fixture.componentRef.setInput('name', 'Jane Doe');
    await fixture.whenStable();
    expect(el.querySelector('[aria-label="Avatar for Jane Doe"]')).not.toBeNull();
  });

  it('should apply size class', async () => {
    fixture.componentRef.setInput('size', 'sm');
    await fixture.whenStable();
    expect(el.querySelector('.avatar--sm')).not.toBeNull();
  });
});
