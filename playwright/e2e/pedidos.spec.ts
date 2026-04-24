import { expect, test } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'
import type { OrderDetails } from '../support/actions/orderLockupActions'
import { insertOrder, deleteOrderByNumber } from '../support/database/orderRepository'
import crypto from 'crypto'

test.describe('Order Lookup', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLockup.open()
  })

  test('should consult an approved order', async ({ app }) => {

    // Test Data
    const order: OrderDetails = {
      number: 'VLO-0D0081',
      status: 'APROVADO',
      color: 'Glacier Blue',
      wheels: 'aero Wheels',
      customer: {
        name: 'Pedro Junior',
        email: 'pedro@velo.dev'
      },
      payment: 'À Vista'
    }

    await deleteOrderByNumber(order.number)
    await insertOrder({
      id: crypto.randomUUID(),
      order_number: order.number,
      color: 'glacier-blue',
      wheel_type: 'aero',
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: '(11) 99999-9999',
      customer_cpf: '780.228.290-05',
      payment_method: 'avista',
      total_price: '40000',
      status: order.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      optionals: [],
    })

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
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Wallace Conen',
        email: 'wconen1@velo.dev'
      },
      payment: 'À Vista'
    }

    await deleteOrderByNumber(order.number)

    await insertOrder({
      id: crypto.randomUUID(),
      order_number: order.number,
      color: 'midnight-black',
      wheel_type: 'sport',
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: '(11) 99999-9999',
      customer_cpf: '780.228.290-05',
      payment_method: 'avista',
      total_price: '40000',
      status: order.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      optionals: [],
    })

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

    await deleteOrderByNumber(order.number)

    await insertOrder({
      id: crypto.randomUUID(),
      order_number: order.number,
      color: 'lunar-white',
      wheel_type: 'aero',
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: '(11) 99999-9999',
      customer_cpf: '780.228.290-05',
      payment_method: 'avista',
      total_price: '40000',
      status: order.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      optionals: [],
    })

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

