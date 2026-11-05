import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import {
  provideRouter,
  Router,
  RouterOutlet
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { expect } from '@jest/globals';

import { LoginComponent } from './login.component';
import { AuthService } from '../../core/service/auth.service';
import { SessionService } from '../../core/service/session.service';
import { SessionInformation } from '../../core/models/sessionInformation.interface';

@Component({
  standalone: true,
  template: '<h1>Sessions page</h1>'
})
class SessionsStubComponent {}

describe('LoginComponent integration', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let httpMock: HttpTestingController;
  let router: Router;
  let sessionService: SessionService;

  const sessionInformation: SessionInformation = {
    id: 1,
    username: 'marie@example.com',
    firstName: 'Marie',
    lastName: 'Dupont',
    admin: false,
    token: 'fake-jwt-token',
    type: 'Bearer'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        AuthService,
        SessionService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {
            path: 'sessions',
            component: SessionsStubComponent
          }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    sessionService = TestBed.inject(SessionService);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function fillForm(
    email = 'marie@example.com',
    password = 'Password123!'
  ): void {
    const element: HTMLElement = fixture.nativeElement;

    const emailInput = element.querySelector<HTMLInputElement>(
      'input[formControlName="email"]'
    )!;

    const passwordInput = element.querySelector<HTMLInputElement>(
      'input[formControlName="password"]'
    )!;

    emailInput.value = email;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));

    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

    fixture.detectChanges();
  }

  function submitForm(): void {
    const form: HTMLFormElement =
      fixture.nativeElement.querySelector('form');

    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
  }

  it('should reject an invalid email', () => {
    fillForm('invalid-email', 'Password123!');

    expect(component.form.get('email')?.invalid).toBe(true);

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector(
        'button[type="submit"]'
      );

    expect(button.disabled).toBe(true);
  });

  it('should reject a password shorter than 3 characters', () => {
    fillForm('marie@example.com', '12');

    expect(component.form.get('password')?.invalid).toBe(true);

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector(
        'button[type="submit"]'
      );

    expect(button.disabled).toBe(true);
  });

  it('should login and update the real SessionService', () => {
    fillForm();

    expect(component.form.valid).toBe(true);

    submitForm();

    const request = httpMock.expectOne('/api/auth/login');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'marie@example.com',
      password: 'Password123!'
    });

    request.flush(sessionInformation);

    expect(sessionService.isLogged).toBe(true);
    expect(sessionService.sessionInformation)
      .toEqual(sessionInformation);
  });

  it('should notify subscribers when login succeeds', () => {
    const loggedStates: boolean[] = [];

    const subscription = sessionService
      .$isLogged()
      .subscribe(value => loggedStates.push(value));

    fillForm();
    submitForm();

    httpMock.expectOne('/api/auth/login')
      .flush(sessionInformation);

    expect(loggedStates).toEqual([false, true]);

    subscription.unsubscribe();
  });

  it('should navigate to sessions after successful login', async () => {
    fillForm();
    submitForm();

    httpMock.expectOne('/api/auth/login')
      .flush(sessionInformation);

    await fixture.whenStable();

    expect(router.url).toBe('/sessions');
    expect(sessionService.isLogged).toBe(true);
  });

  it('should display an error when credentials are invalid', () => {
    fillForm();
    submitForm();

    const request = httpMock.expectOne('/api/auth/login');

    request.flush(
      { message: 'Invalid credentials' },
      {
        status: 401,
        statusText: 'Unauthorized'
      }
    );

    fixture.detectChanges();

    const error: HTMLElement | null =
      fixture.nativeElement.querySelector(
        '[data-cy="login-error"]'
      );

    expect(component.onError).toBe(true);
    expect(error?.textContent).toContain('An error occurred');
    expect(sessionService.isLogged).toBe(false);
  });

  it('should not log in when the server returns 500', () => {
    fillForm();
    submitForm();

    const request = httpMock.expectOne('/api/auth/login');

    request.flush(
      { message: 'Internal server error' },
      {
        status: 500,
        statusText: 'Internal Server Error'
      }
    );

    fixture.detectChanges();

    expect(component.onError).toBe(true);
    expect(sessionService.isLogged).toBe(false);
    expect(sessionService.sessionInformation).toBeUndefined();
  });

  it('should not send a request when submitting with an empty form via the button', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector(
        'button[type="submit"]'
      );

    expect(button.disabled).toBe(true);
    expect(component.form.invalid).toBe(true);

    httpMock.expectNone('/api/auth/login');
  });
});
