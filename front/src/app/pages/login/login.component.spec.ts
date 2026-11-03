
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/service/auth.service';
import { SessionService } from 'src/app/core/service/session.service';
import { SessionInformation } from 'src/app/core/models/sessionInformation.interface';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const authServiceMock = {
    login: jest.fn()
  };

  const sessionServiceMock = {
    logIn: jest.fn()
  };

  const routerMock = {
    navigate: jest.fn()
  };

  const user = {
    id: 1,
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false,
    token: 'fake-token'
  } as SessionInformation;

  beforeEach(async () => {
    jest.clearAllMocks();

    authServiceMock.login.mockReturnValue(of(user) as never);
    routerMock.navigate.mockReturnValue(true as never);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an invalid form', () => {
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.email.hasError('required')).toBe(true);
    expect(component.form.controls.password.hasError('required')).toBe(true);
  });

  it('should require a valid email', () => {
    const email = component.form.controls.email;

    email.setValue('invalid-email');

    expect(email.hasError('email')).toBe(true);

    email.setValue('test@example.com');

    expect(email.valid).toBe(true);
  });

  it('should require a password of at least three characters', () => {
    const password = component.form.controls.password;

    password.setValue('ab');

    expect(password.hasError('minlength')).toBe(true);

    password.setValue('abc');

    expect(password.valid).toBe(true);
  });

  it('should log in and navigate to sessions', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    component.form.setValue(credentials);
    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledWith(credentials);
    expect(sessionServiceMock.logIn).toHaveBeenCalledWith(user);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
    expect(component.onError).toBe(false);
  });

  it('should display an authentication error when login fails', () => {
    authServiceMock.login.mockReturnValue(
      throwError(() => new Error('Invalid credentials')) as never
    );

    component.form.setValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    component.submit();
    fixture.detectChanges();

    expect(component.onError).toBe(true);
    expect(sessionServiceMock.logIn).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should not accept an empty email', () => {
    component.form.setValue({
      email: '',
      password: 'password123'
    });

    expect(component.form.controls.email.hasError('required')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('should not accept an empty password', () => {
    component.form.setValue({
      email: 'test@example.com',
      password: ''
    });

    expect(component.form.controls.password.hasError('required')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });


  it('should disable submit button when form is invalid', () => {
    const submitButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]');

    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    component.form.setValue({
      email: 'test@example.com',
      password: 'password123'
    });

    fixture.detectChanges();

    const submitButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]');

    expect(submitButton.disabled).toBe(false);
  });

  it('should display an error message when authentication fails', () => {
    authServiceMock.login.mockReturnValue(
      throwError(() => new Error('Invalid credentials')) as never
    );

    component.form.setValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    component.submit();
    fixture.detectChanges();

    const errorMessage: HTMLElement | null =
      fixture.nativeElement.querySelector('.error');

    expect(errorMessage).not.toBeNull();
    expect(errorMessage?.textContent?.trim()).toBe('An error occurred');
  });

  it('should toggle password visibility', () => {
    const passwordInput: HTMLInputElement =
      fixture.nativeElement.querySelector('input[formControlName="password"]');

    const toggleButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[mat-icon-button]');

    expect(passwordInput.type).toBe('password');

    toggleButton.click();
    fixture.detectChanges();

    expect(passwordInput.type).toBe('text');

    toggleButton.click();
    fixture.detectChanges();

    expect(passwordInput.type).toBe('password');
  });

});
