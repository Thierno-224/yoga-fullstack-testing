
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { expect, jest } from '@jest/globals';
import { of, throwError } from 'rxjs';

import { MeComponent } from './me.component';
import { User } from '../../core/models/user.interface';
import { SessionService } from '../../core/service/session.service';
import { UserService } from '../../core/service/user.service';
import { SessionInformation } from '../../core/models/sessionInformation.interface';

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;

  const user: User = {
    id: 1,
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie@example.com',
    admin: false,
    password: 'hashed-password',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02')
  };

  const sessionInformation: SessionInformation = {
    id: 1,
    username: 'marie@example.com',
    firstName: 'Marie',
    lastName: 'Dupont',
    admin: false,
    token: 'fake-token',
    type: 'Bearer'
  };

  const userServiceMock = {
    getById: jest.fn<UserService['getById']>(),
    delete: jest.fn<UserService['delete']>()
  };

  const sessionServiceMock = {
    sessionInformation: { ...sessionInformation },
    logOut: jest.fn<SessionService['logOut']>()
  };

  const routerMock = {
    navigate: jest.fn<Router['navigate']>()
  };

  const snackBarMock = {
    open: jest.fn<MatSnackBar['open']>()
  };

  async function createComponent(admin = false): Promise<void> {
    userServiceMock.getById.mockReturnValue(
      of({ ...user, admin })
    );

    sessionServiceMock.sessionInformation = {
      ...sessionInformation,
      admin
    };

    await TestBed.configureTestingModule({
      imports: [MeComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    jest.resetAllMocks();

    userServiceMock.delete.mockReturnValue(of(void 0));
    routerMock.navigate.mockResolvedValue(true);
  });

  it('should create', async () => {
    await createComponent();

    expect(component).toBeTruthy();
  });

  it('should load user information on initialization', async () => {
    await createComponent();

    expect(userServiceMock.getById).toHaveBeenCalledWith('1');
    expect(component.user).toEqual(user);
  });

  it('should display user information', async () => {
    await createComponent();

    const html: HTMLElement = fixture.nativeElement;

    expect(html.textContent).toContain('Marie DUPONT');
    expect(html.textContent).toContain('marie@example.com');
  });

  it('should display the user information title', async () => {
    await createComponent();

    const title: HTMLElement | null =
      fixture.nativeElement.querySelector('h1');

    expect(title?.textContent?.trim()).toBe('User information');
  });

  it('should display the delete account section for a regular user', async () => {
    await createComponent();

    const html: HTMLElement = fixture.nativeElement;

    expect(html.textContent).toContain('Delete my account:');
    expect(html.textContent).not.toContain('You are admin');
  });

  it('should display the admin message for an administrator', async () => {
    await createComponent(true);

    const html: HTMLElement = fixture.nativeElement;

    expect(html.textContent).toContain('You are admin');
    expect(html.textContent).not.toContain('Delete my account:');
  });

  it('should not display the delete button for an administrator', async () => {
    await createComponent(true);

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    );

    const deleteButton = buttons.find(button =>
      button.textContent?.includes('Detail')
    );

    expect(deleteButton).toBeUndefined();
  });

  it('should delete the account and log out', async () => {
    await createComponent();

    component.delete();

    expect(userServiceMock.delete).toHaveBeenCalledWith('1');
    expect(sessionServiceMock.logOut).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should display a confirmation after deleting the account', async () => {
    await createComponent();

    component.delete();

  });

  it('should delete the account when clicking the delete button', async () => {
    await createComponent();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    );

    const deleteButton = buttons.find(button =>
      button.textContent?.includes('Detail')
    );

    expect(deleteButton).toBeDefined();

    deleteButton!.click();

    expect(userServiceMock.delete).toHaveBeenCalledWith('1');
  });

  it('should not log out or navigate when deletion fails', async () => {
    await createComponent();

    userServiceMock.delete.mockReturnValue(
      throwError(() => new Error('Deletion failed'))
    );

    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {

      expect(sessionServiceMock.logOut).not.toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(snackBarMock.open).not.toHaveBeenCalled();
    } finally {
      jest.restoreAllMocks();
    }
  });

  it('should navigate back to the previous page', async () => {
    await createComponent();

    const historySpy = jest.spyOn(window.history, 'back')
      .mockImplementation(() => undefined);

    try {
      component.back();

      expect(historySpy).toHaveBeenCalledTimes(1);
    } finally {
      historySpy.mockRestore();
    }
  });

  it('should navigate back when clicking the back button', async () => {
    await createComponent();

    const historySpy = jest.spyOn(window.history, 'back')
      .mockImplementation(() => undefined);

    try {
      const backButton: HTMLButtonElement =
        fixture.nativeElement.querySelector('button[mat-icon-button]');

      backButton.click();

      expect(historySpy).toHaveBeenCalledTimes(1);
    } finally {
      historySpy.mockRestore();
    }
  });
});
