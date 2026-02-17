import { test, expect } from '@playwright/test'
import { generateOrderCode } from '../support/helpers'
import { OrderLockupPage, OrderDetails } from '../support/pages/OrderLockupPage'

test.describe('Consulta de Pedido', () => {

  test.beforeEach(async ({ page }) => {

    // Arrange
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

  })

  test('should consult an approved order', async ({ page }) => {

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
    const consultaPedido = new OrderLockupPage(page)
    await consultaPedido.searchOrder(order.number)

    // Assert
    await consultaPedido.validateOrderDetails(order)
    await consultaPedido.validateStatusBadge(order.status)

  })

  test('should consult an reproved order', async ({ page }) => {

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
    const consultaPedido = new OrderLockupPage(page)
    await consultaPedido.searchOrder(order.number)

    // Assert
    await consultaPedido.validateOrderDetails(order)
    await consultaPedido.validateStatusBadge(order.status)

  })

  test('should consult in analysis order', async ({ page }) => {

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
    const consultaPedido = new OrderLockupPage(page)
    await consultaPedido.searchOrder(order.number)

    // Assert
    await consultaPedido.validateOrderDetails(order)
    await consultaPedido.validateStatusBadge(order.status)

  })

  test('should show a message when the order is not found', async ({ page }) => {

    const orderCode = generateOrderCode()

    const consultaPedido = new OrderLockupPage(page)
    await consultaPedido.searchOrder(orderCode)

    await consultaPedido.validateOrderNotFound()

  })

  test('should show a message when the order code is outside the expected pattern', async ({ page }) => {

    const orderCode = 'XXX-999'

    const consultaPedido = new OrderLockupPage(page)
    await consultaPedido.searchOrder(orderCode)

    await consultaPedido.validateOrderNotFound()

  })

})

