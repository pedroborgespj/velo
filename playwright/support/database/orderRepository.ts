import { db } from './database'
import type { OrderTable } from './schema.ts'
import crypto from 'crypto'

import { OrderDetails } from '../actions/orderLockupActions.ts'

export function normalizeValue(value: string) {
  if (!value) return '';

  return value
    .normalize('NFD') // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/\s+/g, '') // remove espaços
    .toLowerCase(); // lowercase
}

export async function insertOrder(order: OrderDetails) {
  const data: OrderTable = {
    id: crypto.randomUUID(),
    order_number: order.number,
    color: order.color.toLocaleLowerCase().replace(' ', '-'),
    wheel_type: order.wheels.replace(' Wheels', '').toLowerCase(),
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    customer_cpf: order.customer.document,
    payment_method: normalizeValue(order.payment),
    total_price: order.total_price,
    status: order.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    optionals: [],
  }
  // If the record exists it might throw a duplicate error, but we manage teardown.
  await db.insertInto('orders').values(data).execute()
}

export async function deleteOrderByNumber(orderNumber: string) {
  await db.deleteFrom('orders').where('order_number', '=', orderNumber).execute()
}

export async function deleteOrdersByEmail(email: string) {
  await db.deleteFrom('orders').where('customer_email', '=', email).execute()
}