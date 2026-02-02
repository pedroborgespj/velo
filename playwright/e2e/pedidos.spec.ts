import { test, expect } from '@playwright/test'

test('should consult an approved order', async ({ page }) => {
  // Arrange
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  
  // Act
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-0D0081')
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()
  
  // Assert
  // Some alternative assertion:
  // const orderCode = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-0D0081"]')
  // await expect(orderCode).toBeVisible({ timeout: 10_000 })

  const containerPedido = page.getByRole('paragraph')
    .filter({ hasText: /^Pedido$/ })
    .locator('..') // parent element
  await expect(containerPedido).toContainText('VLO-0D0081', { timeout: 10_000 })

  await expect(page.getByText('APROVADO')).toBeVisible()

});