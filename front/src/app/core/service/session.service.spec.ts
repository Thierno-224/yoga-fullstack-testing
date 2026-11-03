
import { TestBed } from '@angular/core/testing';
import { expect, jest } from '@jest/globals';

import { SessionService } from './session.service';
import { SessionInformation } from '../models/sessionInformation.interface';

describe('SessionService', () => {
  let service: SessionService;

  const user: SessionInformation = {
    id: 1,
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false,
    token: 'fake-token',
    type: 'Bearer'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService]
    });

    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with a logged out state', () => {
    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });

  it('should initially emit false', () => {
    const values: boolean[] = [];

    const subscription = service.$isLogged().subscribe(value => {
      values.push(value);
    });

    expect(values).toEqual([false]);

    subscription.unsubscribe();
  });

  it('should store user information on login', () => {
    service.logIn(user);

    expect(service.sessionInformation).toEqual(user);
    expect(service.isLogged).toBe(true);
  });

  it('should emit true after login', () => {
    const values: boolean[] = [];

    const subscription = service.$isLogged().subscribe(value => {
      values.push(value);
    });

    service.logIn(user);

    expect(values).toEqual([false, true]);

    subscription.unsubscribe();
  });

  it('should clear user information on logout', () => {
    service.logIn(user);
    service.logOut();

    expect(service.sessionInformation).toBeUndefined();
    expect(service.isLogged).toBe(false);
  });

  it('should emit false after logout', () => {
    const values: boolean[] = [];

    const subscription = service.$isLogged().subscribe(value => {
      values.push(value);
    });

    service.logIn(user);
    service.logOut();

    expect(values).toEqual([false, true, false]);

    subscription.unsubscribe();
  });

  it('should provide the current login state to a new subscriber', () => {
    service.logIn(user);

    const values: boolean[] = [];

    const subscription = service.$isLogged().subscribe(value => {
      values.push(value);
    });

    expect(values).toEqual([true]);

    subscription.unsubscribe();
  });

  it('should support multiple subscribers', () => {
    const firstSubscriber = jest.fn<(value: boolean) => void>();
    const secondSubscriber = jest.fn<(value: boolean) => void>();

    const firstSubscription = service.$isLogged().subscribe(firstSubscriber);
    const secondSubscription = service.$isLogged().subscribe(secondSubscriber);

    service.logIn(user);

    expect(firstSubscriber).toHaveBeenCalledWith(true);
    expect(secondSubscriber).toHaveBeenCalledWith(true);

    firstSubscription.unsubscribe();
    secondSubscription.unsubscribe();
  });

  it('should stop notifying a subscriber after unsubscribe', () => {
    const observer = jest.fn<(value: boolean) => void>();

    const subscription = service.$isLogged().subscribe(observer);

    expect(observer).toHaveBeenCalledTimes(1);

    subscription.unsubscribe();

    service.logIn(user);

    expect(observer).toHaveBeenCalledTimes(1);
  });

  it('should update user information when logging in with another user', () => {
    const anotherUser: SessionInformation = {
      ...user,
      id: 2,
      username: 'another@example.com',
      admin: true
    };

    service.logIn(user);
    service.logIn(anotherUser);

    expect(service.sessionInformation).toEqual(anotherUser);
    expect(service.isLogged).toBe(true);
  });

  it('should remain logged out when logout is called without login', () => {
    service.logOut();

    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });
});
