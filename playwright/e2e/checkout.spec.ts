import { test, expect } from '../support/fixtures'
import { deleteOrdersByEmail } from '../support/database/orderRepository'


test.describe('Checkout', () => {

  test.describe('Validações de campos obrigatórios', () => {

    let alerts: any

    test.beforeEach(async ({ app }) => {
      alerts = app.checkout.elements.alerts
    })

    test.beforeEach(async ({ page }) => {
      await page.goto('/order')
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    })
    
    test('should validate all required fields when left blank', async ({ app }) => {

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
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
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
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
      await expect(alerts.email).toHaveText('Email inválido')
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
      await expect(alerts.document).toHaveText('CPF inválido')
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
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

  test.describe('Payment and Confirmation', () => {

    test('should successfully create an order for cash payment', async ({ page, app}) => {
      const customer = {
        name: 'Pedro',
        lastname: 'Borges',
        email: 'checkout-e2e@test.com',
        phone: '(11) 99999-9999',
        document: '00000014141',
        store: 'Velô Paulista',
        paymentMethod: 'À Vista',
        totalPrice: 'R$ 40.000,00',
      }

      await deleteOrdersByEmail(customer.email)

      // Arrange
      await page.goto('/')
      await page.getByRole('link', {name: /Configure Agora/i }).click()

      await app.configurator.validatePrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectedLoaded()

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.expectSummaryTotal(customer.totalPrice)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()
    })
  })


})