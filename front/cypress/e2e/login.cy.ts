describe('Login spec', () => {
  it('should login', () => {
    cy.intercept('POST', '/api/auth/login').as('loginRequest');
    cy.visit('http://localhost:4200/login');
    cy.get('input[formControlName="email"]').type("yoga@studio.com");
    cy.get('input[formControlName="password"]').type("test!1234");
    cy.get('.mdc-button__label').click();
    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('eq', 200);
    cy.url().should('include', '/sessions')

  });


  it('should reject invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login').as('loginRequest');

    cy.visit('/login');

    cy.get('input[formControlName="email"]').type('yoga@studio.com');

    cy.get('input[formControlName="password"]').type('wrongPassword123');

    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('eq', 401);

    cy.get('[data-cy=login-error]')
      .should('be.visible')
      .and('contain.text', 'An error occurred')

    cy.url().should('include', '/login');
  });


  it('should logout successfully', () => {
    cy.intercept('POST', '/api/auth/login').as('loginRequest');

    cy.visit('/login');

    cy.get('input[formControlName="email"]')
      .type('yoga@studio.com');

    cy.get('input[formControlName="password"]')
      .type('test!1234');

    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('eq', 200);

    cy.url().should('include', '/sessions');

    cy.get('[data-cy="logout-button"]').click();

    cy.location('pathname').should('eq', '/login');
  });

  it('should mark required fields as invalid', () => {
    cy.intercept('POST', '/api/auth/login').as('loginRequest');

    cy.visit('/login');
    cy.get('input[formControlName="email"]').focus().blur();

    cy.get('input[formControlName="email"]')
      .should('have.class', 'ng-invalid');

    cy.get('input[formControlName="password"]').focus().blur();

    cy.get('input[formControlName="password"]')
      .should('have.class', 'ng-invalid');

    cy.get('button[type=submit]').should('be.disabled');

  });
});
