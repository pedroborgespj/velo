import { expect, test } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'
import type { OrderDetails } from '../support/actions/orderLockupActions'
import { insertOrder, deleteOrderByNumber } from '../support/database/orderRepository'
import testData from '../support/fixtures/orders.json' with { type: 'json' }

test.describe('Order Lookup', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLockup.open()
  })

  test('should consult an approved order', async ({ app }) => {

    const order = testData.approved as OrderDetails

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    // Act
    await app.orderLockup.searchOrder(order.number)

    // Assert
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)

  })

  test('should consult an reproved order', async ({ app }) => {

    const order = testData.reproved as OrderDetails

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    // Act
    await app.orderLockup.searchOrder(order.number)

    // Assert
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)

  })

  test('should consult in analysis order', async ({ app }) => {

    const order = testData.inAnalysis as OrderDetails

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

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

