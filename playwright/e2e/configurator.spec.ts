import { test } from '../support/fixtures'

test.describe('Vehicle Configuration', () => {

  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('should update vehicle image and keep price unchanged when changing color', async ({ app }) => {
    await app.configurator.validatePrice('40.000,00')

    await app.configurator.selectColor('Midnight Black')
    await app.configurator.validatePrice('40.000,00')
    await app.configurator.validateCarImage('/src/assets/midnight-black-aero-wheels.png')
  })

  test('should update vehicle image and recalculate total price when changing wheels', async ({ app }) => {
    await app.configurator.validatePrice('40.000,00')

    await app.configurator.selectWheels(/Sport Wheels/)
    await app.configurator.validatePrice('42.000,00')
    await app.configurator.validateCarImage('/src/assets/glacier-blue-sport-wheels.png')

    await app.configurator.selectWheels(/Aero Wheels/)
    await app.configurator.validatePrice('40.000,00')
    await app.configurator.validateCarImage('/src/assets/glacier-blue-aero-wheels.png')
  })
})
