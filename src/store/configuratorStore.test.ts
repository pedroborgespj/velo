import { describe, it, expect } from 'vitest';
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  type CarConfiguration,
} from './configuratorStore';

const baseConfig: CarConfiguration = {
  exteriorColor: 'glacier-blue',
  interiorColor: 'carbon-black',
  wheelType: 'aero',
  optionals: [],
};

describe('calculateTotalPrice', () => {
  it('returns the base price for a default configuration', () => {
    expect(calculateTotalPrice(baseConfig)).toBe(40000);
  });

  it('adds R$ 2.000 for sport wheels', () => {
    expect(calculateTotalPrice({ ...baseConfig, wheelType: 'sport' })).toBe(42000);
  });

  it('adds the price of each selected optional', () => {
    expect(
      calculateTotalPrice({
        ...baseConfig,
        optionals: ['precision-park', 'flux-capacitor'],
      })
    ).toBe(40000 + 5500 + 5000);
  });

  it('combines sport wheels and optionals', () => {
    expect(
      calculateTotalPrice({
        ...baseConfig,
        wheelType: 'sport',
        optionals: ['precision-park'],
      })
    ).toBe(40000 + 2000 + 5500);
  });
});

describe('calculateInstallment', () => {
  it('calculates the 12x installment with 2% monthly compound interest', () => {
    expect(calculateInstallment(40000)).toBeCloseTo(3782.38, 2);
  });

  it('returns a value rounded to two decimal places', () => {
    const installment = calculateInstallment(50000);
    expect(installment).toBe(Math.round(installment * 100) / 100);
  });
});

describe('formatPrice', () => {
  it('formats a value as Brazilian currency (BRL)', () => {
    // Intl uses a non-breaking space between the symbol and the value.
    expect(formatPrice(40000)).toBe('R$ 40.000,00');
  });

  it('formats decimal values with two digits', () => {
    expect(formatPrice(3782.54)).toBe('R$ 3.782,54');
  });
});
