import { test, expect } from '../support/fixtures'

test.describe('Checkout', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/order')
    await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
  })

  test.describe('Validações de campos obrigatórios', () => {
    test('should validate all required fields when left blank', async ({ app }) => {

      // Act
      await app.checkout.submit()

      // Assert
      await expect(app.checkout.elements.alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(app.checkout.elements.alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(app.checkout.elements.alerts.email).toHaveText('Email inválido')
      await expect(app.checkout.elements.alerts.phone).toHaveText('Telefone inválido')
      await expect(app.checkout.elements.alerts.document).toHaveText('CPF inválido')
      await expect(app.checkout.elements.alerts.store).toHaveText('Selecione uma loja')
      await expect(app.checkout.elements.alerts.terms).toHaveText('Aceite os termos')
    })

    test('should validate minimum character limit for Name and Lastname', async ({ app }) => {

      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'test@test.com',
        phone: '(11) 99999-9999',
        document: '00000014141',
      } 
      
      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(app.checkout.elements.alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(app.checkout.elements.alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('should display error for invalid email format', async ({ app }) => {

      const customer = {
        name: 'Pedro',
        lastname: 'Borges',
        email: 'test@.com',
        phone: '(11) 99999-9999',
        document: '00000014141',
      } 
      
      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(app.checkout.elements.alerts.email).toHaveText('Email inválido')
    })

    test('should display error for invalid CPF', async ({ app }) => {

      const customer = {
        name: 'Pedro',
        lastname: 'Borges',
        email: 'test@test.com',
        phone: '(11) 99999-9999',
        document: '00000014199',
      } 
      
      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(app.checkout.elements.alerts.document).toHaveText('CPF inválido')
    })

    test('should require terms acceptance when submitting with valid data', async ({ app }) => {

      const customer = {
        name: 'Pedro',
        lastname: 'Borges',
        email: 'test@test.com',
        phone: '(11) 99999-9999',
        document: '00000014141',
      } 
      
      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')

      await expect(app.checkout.elements.terms).not.toBeChecked()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(app.checkout.elements.alerts.terms).toHaveText('Aceite os termos')
    })
  })


})