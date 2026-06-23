import { Page, expect } from '@playwright/test'

export function createConfiguratorActions(page: Page) {
  return {
    async open() {
      await page.goto('/configure')
    },

    async selectColor(name: string) {
      await page.getByRole('button', { name }).click()
    },

    async selectWheels(name: string | RegExp) {
      await page.getByRole('button', { name }).click()
    },

    async validatePrice(price: string) {
      const totalPrice = page.getByTestId('total-price')
      await expect(totalPrice).toContainText(price)
    },

    async validateCarImage(expectedSrc: string | RegExp) {
      const carImage = page.locator('img[alt^="Velô Sprint"]')
      await expect(carImage).toHaveAttribute('src', expectedSrc)
    },

    async toggleOptional(name: string) {
      await page.getByRole('checkbox', { name: new RegExp(name) }).click()
    },

    async finishConfigurator() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
    },

  }
}
