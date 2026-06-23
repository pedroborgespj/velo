import { test } from '../support/fixtures'

test.describe('Vehicle Configuration', () => {

  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('should update vehicle image and keep price unchanged when changing color', async ({ app }) => {
    await app.configurator.validatePrice('40.000,00')

    await app.configurator.selectColor('Midnight Black')
    await app.configurator.validatePrice('40.000,00')
    await app.configurator.validateCarImage(/midnight-black-aero-wheels/)
  })

  test('should update vehicle image and recalculate total price when changing wheels', async ({ app }) => {
    await app.configurator.validatePrice('40.000,00')

    await app.configurator.selectWheels(/Sport Wheels/)
    await app.configurator.validatePrice('42.000,00')
    await app.configurator.validateCarImage(/glacier-blue-sport-wheels/)

    await app.configurator.selectWheels(/Aero Wheels/)
    await app.configurator.validatePrice('40.000,00')
    await app.configurator.validateCarImage(/glacier-blue-aero-wheels/)
  })

  test('should update price when adding and removing optionals and navigate to checkout', async ({ app }) => {
    await app.configurator.validatePrice('40.000,00')

    await app.configurator.toggleOptional('Precision Park')
    await app.configurator.validatePrice('45.500,00')

    await app.configurator.toggleOptional('Flux Capacitor')
    await app.configurator.validatePrice('50.500,00')

    await app.configurator.toggleOptional('Precision Park')
    await app.configurator.toggleOptional('Flux Capacitor')
    await app.configurator.validatePrice('40.000,00')

    await app.configurator.toggleOptional('Precision Park')
    await app.configurator.toggleOptional('Flux Capacitor')
    await app.configurator.validatePrice('50.500,00')

    await app.configurator.finishConfigurator()
    await app.checkout.expectedLoaded()
    await app.checkout.expectSummaryTotal('50.500,00')
  })
})
