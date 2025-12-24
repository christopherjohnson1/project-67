import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TerminalLoginComponent } from './terminal-login.component';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';

describe('TerminalLoginComponent', () => {
  let component: TerminalLoginComponent;
  let fixture: ComponentFixture<TerminalLoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TerminalLoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TerminalLoginComponent);
    component = fixture.componentInstance;
    mockAuthService.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display boot sequence on init', () => {
    expect(component.lines.length).toBeGreaterThan(0);
  });

  it('should handle help command', () => {
    component.currentInput = 'help';
    component['processInput']();
    
    const helpLines = component.lines.filter(line => 
      line.text.includes('Available commands') || line.text.includes('help')
    );
    expect(helpLines.length).toBeGreaterThan(0);
  });
});


