import { CURRENCY, findProduct } from './catalog.js';

// Demonstration limits, not inventory quantities or production business rules.
export const MAX_LINES = 8;
export const MAX_UNITS_PER_ITEM = 12;

type Rejection = 'invalid_payload' | 'cart_size' | 'invalid_item'
  | 'invalid_quantity' | 'duplicate_product' | 'unknown_product' | 'unavailable_product';

export class CheckoutInputError extends Error {
  constructor(readonly code: Rejection) {
    super(code);
    this.name = 'CheckoutInputError';
  }
}

export interface PricedLine {
  readonly productId: string;
  readonly name: string;
  readonly quantity: number;
  readonly unitPriceMinor: number;
  readonly lineTotalMinor: number;
}

export interface Quote {
  readonly currency: typeof CURRENCY;
  readonly lines: readonly Readonly<PricedLine>[];
  readonly totalMinor: number;
}

export interface CheckoutSession {
  readonly id: string;
  readonly quote: Quote;
}

export interface SessionCreator {
  create(quote: Quote): Promise<CheckoutSession>;
}

/** This boundary accepts decoded JSON, not an HTTP request or a trusted DTO. */
function exactObject(value: unknown, fields: readonly string[], code: Rejection): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)
    || Object.getPrototypeOf(value) !== Object.prototype) throw new CheckoutInputError(code);
  const keys = Reflect.ownKeys(value);
  if (keys.length !== fields.length || fields.some(field => !Object.hasOwn(value, field))) {
    throw new CheckoutInputError(code);
  }
  return value as Record<string, unknown>;
}

function parseCart(input: unknown): readonly { productId: string; quantity: number }[] {
  const body = exactObject(input, ['items'], 'invalid_payload');
  const items = body['items'];
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINES) {
    throw new CheckoutInputError('cart_size');
  }
  const seen = new Set<string>();
  return Array.from(items, item => {
    const entry = exactObject(item, ['productId', 'quantity'], 'invalid_item');
    const id = entry['productId'];
    const quantity = entry['quantity'];
    if (typeof id !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(id)) {
      throw new CheckoutInputError('invalid_item');
    }
    if (typeof quantity !== 'number' || !Number.isSafeInteger(quantity)
      || quantity < 1 || quantity > MAX_UNITS_PER_ITEM) {
      throw new CheckoutInputError('invalid_quantity');
    }
    if (seen.has(id)) throw new CheckoutInputError('duplicate_product');
    seen.add(id);
    return { productId: id, quantity };
  });
}

function minorUnits(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid server-side money value.');
  return value;
}

export function quoteCart(input: unknown): Quote {
  const request = parseCart(input);
  const lines = request.map(({ productId, quantity }): Readonly<PricedLine> => {
    const product = findProduct(productId);
    if (!product) throw new CheckoutInputError('unknown_product');
    if (!product.available) throw new CheckoutInputError('unavailable_product');
    const unitPriceMinor = minorUnits(product.priceMinor);
    return Object.freeze({
      productId: product.id, name: product.name, quantity, unitPriceMinor,
      lineTotalMinor: minorUnits(unitPriceMinor * quantity),
    });
  });
  const totalMinor = lines.reduce((total, line) => minorUnits(total + line.lineTotalMinor), 0);
  return Object.freeze({ currency: CURRENCY, lines: Object.freeze(lines), totalMinor });
}

export async function startCheckout(input: unknown, sessions: SessionCreator): Promise<CheckoutSession> {
  // Resolve and validate every line before crossing the session-creation boundary.
  const quote = quoteCart(input);
  return sessions.create(quote);
}
