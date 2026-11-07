describe('Sessions spec', () => {

  it('should display sessions', () => {
    cy.intercept('GET', '/api/session').as('getSessions');

    cy.login('yoga@studio.com', 'test!1234');

    cy.url().should('include', '/sessions');

    cy.wait('@getSessions')
      .its('response.statusCode')
      .should('eq', 200);

    cy.get('mat-card').should('have.length.at.least', 1);
  });

  it('should display admin buttons', () => {
    cy.login('yoga@studio.com', 'test!1234');

    cy.get('[data-cy="btn-create"]')
      .should('be.visible')
      .and('contain.text', 'Create');

    cy.get('[data-cy="btn-edit"]')
      .should('be.visible')
      .and('contain.text', 'Edit');
  });

  it('should hide admin buttons for regular user ', () => {
    cy.login('user@yoga.test', 'test!1234');

    cy.url().should('include', '/sessions');

    cy.get('[data-cy="btn-create"]')
      .should('not.exist')

    cy.get('[data-cy="btn-edit"]')
      .should('not.exist')
  });

  it('should display session details and button delete', () => {
    cy.login('yoga@studio.com', 'test!1234');

    cy.get('[data-cy="btn-detail"]').first().click();

    cy.url().should('match', /\/sessions\/detail\/\d+$/);

    cy.get('mat-card').should('be.visible');
    cy.get('[data-cy=btn-delete]').should('be.visible')
  });

  it('should create a session', () => {
    cy.login('yoga@studio.com', 'test!1234');

    cy.get('[data-cy="btn-create"]').click();

    cy.get('input[formControlName="name"]').type('Yoga E2E Test');
    cy.get('input[formControlName="date"]').type('2026-12-15');

    cy.get('mat-select[formControlName="teacher_id"]').click();
    cy.get('mat-option').first().click();

    cy.get('textarea[formControlName="description"]')
      .type('Session created by Cypress E2E test');

    cy.intercept('POST', '/api/session').as('createSession');

    cy.get('button[type="submit"]').click();

    cy.wait('@createSession')
      .its('response.statusCode')
      .should('eq', 200);

    cy.url().should('include', '/sessions');
  });

  it('should prevent session creation when name is empty', () => {
    cy.login('yoga@studio.com', 'test!1234');

    cy.get('[data-cy="btn-create"]').click();

    cy.get('input[formControlName="name"]')
      .focus()
      .blur()
      .should('have.class', 'ng-invalid');

    cy.get('button[type="submit"]')
      .should('be.disabled');
  });

  it('should delete a session', () => {
    cy.login('yoga@studio.com', 'test!1234');

    cy.get('[data-cy="btn-detail"]').first().click();

    cy.intercept('DELETE', '/api/session/*').as('deleteSession');

    cy.get('[data-cy="btn-delete"]').click();

    cy.wait('@deleteSession')
      .its('response.statusCode')
      .should('eq', 200);

    cy.url().should('include', '/sessions');
  });

    it('should update a session', () => {
      cy.login('yoga@studio.com', 'test!1234');

      cy.get('[data-cy="btn-edit"]').first().click();

      cy.contains('h1', 'Update session').should('be.visible');

      cy.get('input[formControlName="name"]')
        .clear()
        .type('Yoga Updated E2E');

      cy.intercept('PUT', '/api/session/*').as('updateSession');

      cy.get('button[type="submit"]').click();

      cy.wait('@updateSession')
        .its('response.statusCode')
        .should('eq', 200);

      cy.url().should('include', '/sessions');
    });
});
