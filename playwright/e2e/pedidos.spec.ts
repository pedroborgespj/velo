import { test } from '@playwright/test'
import { generateOrderCode } from '../support/helpers'
import { LandingPage } from '../support/pages/LandingPage'
import { Navbar } from '../support/components/Navbar'
import { OrderLockupPage, OrderDetails } from '../support/pages/OrderLockupPage'

test.describe('Consulta de Pedido', () => {

  let orderLockupPage: OrderLockupPage

  test.beforeEach(async ({ page }) => {
    await new LandingPage(page).goto()
    await new Navbar(page).orderLockupLink()

    orderLockupPage = new OrderLockupPage(page) 
    await orderLockupPage.validatePageLoaded()
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
    await orderLockupPage.searchOrder(order.number)

    // Assert
    await orderLockupPage.validateOrderDetails(order)
    await orderLockupPage.validateStatusBadge(order.status)

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
    await orderLockupPage.searchOrder(order.number)

    // Assert
    await orderLockupPage.validateOrderDetails(order)
    await orderLockupPage.validateStatusBadge(order.status)

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
    await orderLockupPage.searchOrder(order.number)

    // Assert
    await orderLockupPage.validateOrderDetails(order)
    await orderLockupPage.validateStatusBadge(order.status)

  })

  test('should show a message when the order is not found', async ({ page }) => {

    const orderCode = generateOrderCode()

    await orderLockupPage.searchOrder(orderCode)
    await orderLockupPage.validateOrderNotFound()

  })

  test('should show a message when the order code is outside the expected pattern', async ({ page }) => {

    const orderCode = 'XXX-999'

    await orderLockupPage.searchOrder(orderCode)
    await orderLockupPage.validateOrderNotFound()

  })

})

