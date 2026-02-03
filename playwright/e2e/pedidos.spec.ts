import { test, expect } from '@playwright/test'
import { generateOrderCode } from '../support/helpers'

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
    const order = 'VLO-0D0081'

    // Act
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order)
    await page.getByRole('button', { name: 'Buscar Pedido' }).click()

    // Assert
    // Some alternative assertion:
    // const orderCode = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-0D0081"]')
    // await expect(orderCode).toBeVisible({ timeout: 10_000 })

    // const containerPedido = page.getByRole('paragraph')
    //   .filter({ hasText: /^Pedido$/ })
    //   .locator('..') // parent element
    // await expect(containerPedido).toContainText(order, { timeout: 10_000 })

    // await expect(page.getByText('APROVADO')).toBeVisible()

    await expect(page.getByTestId(`order-result-${order}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order}
      - img
      - text: APROVADO
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: Midnight Black
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: sport Wheels
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: Pedro Junior
      - paragraph: Email
      - paragraph: pedro@velo.dev
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: À Vista
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)

  })

  test('should show a message when the order is not found', async ({ page }) => {

    const order = generateOrderCode()

    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order)
    await page.getByRole('button', { name: 'Buscar Pedido' }).click()

    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `)

  })

})

