describe('Account spec', () => {
  it('should display user information', () => {
    cy.login('yoga@studio.com', 'test!1234');

    cy.get('[data-cy="account"]').click();

    cy.contains('h1', 'User information').should('be.visible');

    cy.contains('p', 'Email: yoga@studio.com')
      .should('be.visible');

    cy.contains('p', 'Name:')
      .should('be.visible');

    cy.contains('p', 'You are admin')
      .should('be.visible');

    cy.contains('p', 'Create at:')
      .should('be.visible');

    cy.contains('p', 'Last update:')
      .should('be.visible');
  });
});
