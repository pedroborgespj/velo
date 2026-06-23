import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  useConfiguratorStore,
  type CarConfiguration,
  type Order,
} from './configuratorStore';

const baseConfig: CarConfiguration = {
  exteriorColor: 'glacier-blue',
  interiorColor: 'carbon-black',
  wheelType: 'aero',
  optionals: [],
};

const makeOrder = (email: string): Order => ({
  id: `order-${email}`,
  configuration: baseConfig,
  totalPrice: 40000,
  customer: {
    name: 'Ana',
    surname: 'Silva',
    email,
    phone: '11999999999',
    cpf: '12345678900',
    store: 'SP',
  },
  paymentMethod: 'avista',
  status: 'APROVADO',
  createdAt: '2026-01-01',
});

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
    // Intl uses a non-breaking space ( ) between the symbol and the value.
    expect(formatPrice(40000)).toBe('R$ 40.000,00');
  });

  it('formats decimal values with two digits', () => {
    expect(formatPrice(3782.54)).toBe('R$ 3.782,54');
  });
});

describe('login / getUserOrders', () => {
  beforeEach(() => {
    useConfiguratorStore.setState({ orders: [], currentUserEmail: null });
  });

  it('logs in when an order with that email exists', () => {
    useConfiguratorStore.setState({ orders: [makeOrder('ana@example.com')] });
    const success = useConfiguratorStore.getState().login('ana@example.com');
    expect(success).toBe(true);
    expect(useConfiguratorStore.getState().currentUserEmail).toBe('ana@example.com');
  });

  it('does not log in for an unknown email', () => {
    useConfiguratorStore.setState({ orders: [makeOrder('ana@example.com')] });
    const success = useConfiguratorStore.getState().login('bob@example.com');
    expect(success).toBe(false);
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull();
  });

  it('returns an empty list when no one is logged in', () => {
    useConfiguratorStore.setState({ orders: [makeOrder('ana@example.com')] });
    expect(useConfiguratorStore.getState().getUserOrders()).toEqual([]);
  });

  it('returns only the orders of the logged-in user', () => {
    useConfiguratorStore.setState({
      orders: [makeOrder('ana@example.com'), makeOrder('bob@example.com')],
    });
    useConfiguratorStore.getState().login('ana@example.com');
    const orders = useConfiguratorStore.getState().getUserOrders();
    expect(orders).toHaveLength(1);
    expect(orders[0].customer.email).toBe('ana@example.com');
  });
});
