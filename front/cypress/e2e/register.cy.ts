describe('register spec', ()=> {

  it('should register', () => {

    const email = `test${crypto.randomUUID()}@gmail.com`
    cy.intercept('POST', '/api/auth/register').as('registerRequest');
    cy.visit('http://localhost:4200/register');
    cy.get('input[formControlName="firstName"]').type('FirstNameTest');
    cy.get('input[formControlName="lastName"]').type('LastNameTest')
    cy.get('input[formControlName="email"]').type(email);
    cy.get('input[formControlName="password"]').type("test!1234");
    cy.get('button[type="submit"]').click();
    cy.wait('@registerRequest')
      .its('response.statusCode')
      .should('eq', 200);

    cy.url().should('include', '/login');
  });


  it('should reject registration when email is empty', () => {
    cy.visit('http://localhost:4200/register');

    cy.get('input[formControlName="firstName"]').type('FirstNameTest');
    cy.get('input[formControlName="lastName"]').type('LastNameTest');
    cy.get('input[formControlName="password"]').type('test!1234');

    cy.get('input[formControlName="email"]')
      .focus()
      .blur()
      .should('have.class', 'ng-invalid');

    cy.get('button[type="submit"]').should('be.disabled');
  });
})
