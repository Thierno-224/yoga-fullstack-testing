
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/service/auth.service';
import { RegisterRequest } from '../../core/models/registerRequest.interface';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const authServiceMock = {
    register: jest.fn<(...args: [RegisterRequest]) => ReturnType<AuthService['register']>>()
  };

  const routerMock = {
    navigate: jest.fn<(...args: Parameters<Router['navigate']>) => Promise<boolean>>()
  };

  const validRequest: RegisterRequest = {
    firstName: 'Thierno',
    lastName: 'Bah',
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    authServiceMock.register.mockReturnValue(of(void 0));
    routerMock.navigate.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an invalid form', () => {
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.email.hasError('required')).toBe(true);
    expect(component.form.controls.firstName.hasError('required')).toBe(true);
    expect(component.form.controls.lastName.hasError('required')).toBe(true);
    expect(component.form.controls.password.hasError('required')).toBe(true);
  });

  it('should initialize without an error', () => {
    expect(component.onError).toBe(false);
  });

  it('should reject an invalid email', () => {
    const email = component.form.controls.email;

    email.setValue('invalid-email');
    expect(email.hasError('email')).toBe(true);

    email.setValue('test@example.com');
    expect(email.valid).toBe(true);
  });

  it('should require an email', () => {
    const email = component.form.controls.email;

    email.setValue('');
    expect(email.hasError('required')).toBe(true);
  });

  it('should require a first name', () => {
    const firstName = component.form.controls.firstName;

    firstName.setValue('');
    expect(firstName.hasError('required')).toBe(true);
  });

  it('should require a last name', () => {
    const lastName = component.form.controls.lastName;

    lastName.setValue('');
    expect(lastName.hasError('required')).toBe(true);
  });

  it('should require a password', () => {
    const password = component.form.controls.password;

    password.setValue('');
    expect(password.hasError('required')).toBe(true);
  });

  it('should accept a valid registration form', () => {
    component.form.setValue(validRequest);

    expect(component.form.valid).toBe(true);
  });

  it('should reject a non-numeric first name value for min validation', () => {
    const firstName = component.form.controls.firstName;

    firstName.setValue('12');
    expect(firstName.hasError('min')).toBe(false);
  });

  it('should validate the numeric minimum for first name', () => {
    const firstName = component.form.controls.firstName;

    firstName.setValue('2');
    expect(firstName.hasError('min')).toBe(true);

    firstName.setValue('3');
    expect(firstName.hasError('min')).toBe(false);
  });

  it('should validate the numeric maximum for first name', () => {
    const firstName = component.form.controls.firstName;

    firstName.setValue('21');
    expect(firstName.hasError('max')).toBe(true);

    firstName.setValue('20');
    expect(firstName.hasError('max')).toBe(false);
  });

  it('should validate the numeric minimum and maximum for last name', () => {
    const lastName = component.form.controls.lastName;

    lastName.setValue('2');
    expect(lastName.hasError('min')).toBe(true);

    lastName.setValue('21');
    expect(lastName.hasError('max')).toBe(true);

    lastName.setValue('10');
    expect(lastName.valid).toBe(true);
  });

  it('should validate the numeric minimum and maximum for password', () => {
    const password = component.form.controls.password;

    password.setValue('2');
    expect(password.hasError('min')).toBe(true);

    password.setValue('41');
    expect(password.hasError('max')).toBe(true);

    password.setValue('password123');
    expect(password.valid).toBe(true);
  });

  it('should register successfully and navigate to login', () => {
    component.form.setValue(validRequest);

    component.submit();

    expect(authServiceMock.register).toHaveBeenCalledTimes(1);
    expect(authServiceMock.register).toHaveBeenCalledWith(validRequest);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.onError).toBe(false);
  });

  it('should display an authentication error when registration fails', () => {
    authServiceMock.register.mockReturnValue(
      throwError(() => new Error('Registration failed'))
    );

    component.form.setValue(validRequest);
    component.submit();

    expect(component.onError).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should display an error message in the template when registration fails', () => {
    authServiceMock.register.mockReturnValue(
      throwError(() => new Error('Registration failed'))
    );

    component.form.setValue(validRequest);
    component.submit();
    fixture.detectChanges();

    const errorMessage: HTMLElement | null =
      fixture.nativeElement.querySelector('.error');

    expect(errorMessage).not.toBeNull();
    expect(errorMessage?.textContent?.trim()).toBe('An error occurred');
  });

  it('should not display an error message initially', () => {
    const errorMessage: HTMLElement | null =
      fixture.nativeElement.querySelector('.error');

    expect(errorMessage).toBeNull();
  });

  it('should disable the submit button when the form is invalid', () => {
    const submitButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]');

    expect(submitButton.disabled).toBe(true);
  });

  it('should enable the submit button when the form is valid', () => {
    component.form.setValue(validRequest);
    fixture.detectChanges();

    const submitButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]');

    expect(submitButton.disabled).toBe(false);
  });

  it('should submit the registration form through the HTML form', () => {
    component.form.setValue(validRequest);
    fixture.detectChanges();

    const form: HTMLFormElement =
      fixture.nativeElement.querySelector('form');

    form.dispatchEvent(new Event('submit', {
      bubbles: true,
      cancelable: true
    }));

    expect(authServiceMock.register).toHaveBeenCalledWith(validRequest);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should contain all registration fields', () => {
    const form: HTMLElement = fixture.nativeElement;

    expect(form.querySelector('input[formControlName="firstName"]')).not.toBeNull();
    expect(form.querySelector('input[formControlName="lastName"]')).not.toBeNull();
    expect(form.querySelector('input[formControlName="email"]')).not.toBeNull();
    expect(form.querySelector('input[formControlName="password"]')).not.toBeNull();
  });
});
