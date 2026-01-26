import { test, expect } from '@playwright/test'

test('should consult an approved order', async ({ page }) => {
  // Arrange
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  
  // Act
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-0D0081')
  await page.getByTestId('search-order-button').click()
  
  // Assert
  await expect(page.getByTestId('order-result-id')).toBeVisible()
  await expect(page.getByTestId('order-result-id')).toContainText('VLO-0D0081')
  await expect(page.getByTestId('order-result-status')).toBeVisible()
  await expect(page.getByTestId('order-result-status')).toContainText('APROVADO')

});