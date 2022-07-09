import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdaptationMenuComponent } from './adaptation-menu.component';

describe('AdaptationMenuComponent', () => {
  let component: AdaptationMenuComponent;
  let fixture: ComponentFixture<AdaptationMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdaptationMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdaptationMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
