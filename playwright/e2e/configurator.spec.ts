import { test, expect } from '../support/fixtures'

test.describe('Vehicle Configuration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/configure')
  })

  test('should update vehicle image and keep price unchanged when changing color', async ({ page }) => {
    const priceElement = page.getByTestId('total-price')
    const car = page.locator('img[alt^="Velô Sprint"]')

    await expect(priceElement).toBeVisible()
    await expect(priceElement).toContainText('40.000,00')

    await page.getByRole('button', { name: 'Midnight Black' }).click()
    await expect(priceElement).toContainText('40.000,00')

    await expect(car).toHaveAttribute('src', '/src/assets/midnight-black-aero-wheels.png')

  })

  test('should update vehicle image and recalculate total price when changing wheels', async ({ page }) => {
    const priceElement = page.getByTestId('total-price')
    const car = page.locator('img[alt^="Velô Sprint"]')

    await expect(priceElement).toBeVisible()
    await expect(priceElement).toContainText('40.000,00')

    await page.getByRole('button', { name: /Sport Wheels/ }).click()
    await expect(priceElement).toContainText('42.000,00')

    await expect(car).toHaveAttribute('src', '/src/assets/glacier-blue-sport-wheels.png')

    await page.getByRole('button', { name: /Aero Wheels/ }).click()
    await expect(priceElement).toContainText('40.000,00')

    await expect(car).toHaveAttribute('src', '/src/assets/glacier-blue-aero-wheels.png')

  })
})

