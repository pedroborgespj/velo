import { expect, test } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'
import type { OrderDetails } from '../support/actions/orderLockupActions'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLockup.open()
  })

  test('should consult an approved order', async ({ app }) => {

    // Test Data
    const order: OrderDetails = {
      number: 'VLO-0D0081',
      status: 'APROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Pedro Junior',
        email: 'pedro@velo.dev'
      },
      payment: 'À Vista'
    }

    // Act
    await app.orderLockup.searchOrder(order.number)

    // Assert
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)

  })

  test('should consult an reproved order', async ({ app }) => {

    // Test Data
    const order: OrderDetails = {
      number: 'VLO-ZQ33YD',
      status: 'REPROVADO',
      color: 'Glacier Blue',
      wheels: 'aero Wheels',
      customer: {
        name: 'Wallace Conen',
        email: 'wconen1@velo.dev'
      },
      payment: 'À Vista'
    }

    // Act
    await app.orderLockup.searchOrder(order.number)

    // Assert
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)

  })

  test('should consult in analysis order', async ({ app }) => {

    // Test Data
    const order: OrderDetails = {
      number: 'VLO-PI0ADZ',
      status: 'EM_ANALISE',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'João da Silva',
        email: 'joao@velo.dev'
      },
      payment: 'À Vista'
    }

    // Act
    await app.orderLockup.searchOrder(order.number)

    // Assert
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)

  })

  test('should show a message when the order is not found', async ({ app }) => {

    const orderCode = generateOrderCode()

    await app.orderLockup.searchOrder(orderCode)
    await app.orderLockup.validateOrderNotFound()

  })

  test('should show a message when the order code is outside the expected pattern', async ({ app }) => {

    const orderCode = 'XXX-999'

    await app.orderLockup.searchOrder(orderCode)
    await app.orderLockup.validateOrderNotFound()

  })

  test('should disable search when input is empty or whitespace', async ({ app }) => {

      const button = app.orderLockup.elements.searchButton
      await expect(button).toBeDisabled()

      await app.orderLockup.elements.orderInput.fill('     ')
      await expect(button).toBeDisabled()
  })

})

