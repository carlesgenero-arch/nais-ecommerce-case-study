import assert from 'node:assert/strict';
import test from 'node:test';
import { CheckoutInputError, MAX_LINES, MAX_UNITS_PER_ITEM, startCheckout } from '../dist/checkout.js';
import { FakeSessionCreator } from '../dist/fake-session.js';

const item = (quantity = 1) => ({ productId: 'orbit-notebook', quantity });

async function rejected(input, code) {
  const sessions = new FakeSessionCreator();
  await assert.rejects(startCheckout(input, sessions),
    error => error instanceof CheckoutInputError && error.code === code);
  assert.equal(sessions.requests.length, 0);
}

test('valid checkout resolves fictional prices, names and currency on the server', async () => {
  const sessions = new FakeSessionCreator();
  const session = await startCheckout({ items: [item(2), { productId: 'cedar-pencil-set', quantity: 1 }] }, sessions);
  assert.equal(session.id, 'fictional-session-1');
  assert.equal(session.quote.currency, 'USD');
  assert.deepEqual(session.quote.lines, [
    { productId: 'orbit-notebook', name: 'Orbit Notebook', quantity: 2, unitPriceMinor: 795, lineTotalMinor: 1590 },
    { productId: 'cedar-pencil-set', name: 'Cedar Pencil Set', quantity: 1, unitPriceMinor: 425, lineTotalMinor: 425 },
  ]);
  assert.equal(session.quote.totalMinor, 2015);
  assert.ok(Number.isSafeInteger(session.quote.totalMinor));
  assert.equal(sessions.requests.length, 1);
  assert.equal(sessions.requests[0], session.quote);
});

test('the maximum item quantity is accepted', async () => {
  const session = await startCheckout({ items: [item(MAX_UNITS_PER_ITEM)] }, new FakeSessionCreator());
  assert.equal(session.quote.totalMinor, MAX_UNITS_PER_ITEM * 795);
});

for (const input of [null, false, [], 'not an object', {}, { items: [], extra: true }]) {
  test('rejects malformed payload: ' + JSON.stringify(input), () => rejected(input, 'invalid_payload'));
}

for (const items of [[], null, {}, Array.from({ length: MAX_LINES + 1 }, () => item())]) {
  test('rejects invalid cart size/type: ' + JSON.stringify(items), () => rejected({ items }, 'cart_size'));
}

for (const quantity of [0, -1, 1.5, '2', Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER, MAX_UNITS_PER_ITEM + 1]) {
  test('rejects quantity ' + String(quantity), () => rejected({ items: [item(quantity)] }, 'invalid_quantity'));
}

for (const entry of [null, [], {}, { productId: 'orbit-notebook' }, { ...item(), unitPriceMinor: 1 },
  { ...item(), available: true }, { productId: '../catalog', quantity: 1 }]) {
  test('rejects malformed or enriched item: ' + JSON.stringify(entry), () => rejected({ items: [entry] }, 'invalid_item'));
}

for (const [key, value] of [['totalMinor', 1], ['currency', 'EUR'], ['discountMinor', 99999]]) {
  test('rejects client-controlled ' + key, () => rejected({ items: [item()], [key]: value }, 'invalid_payload'));
}

test('prototype-like product names cannot escape the catalogue lookup', () =>
  rejected({ items: [{ productId: 'constructor', quantity: 1 }] }, 'unknown_product'));

test('unknown products are rejected', () =>
  rejected({ items: [{ productId: 'imaginary-pen', quantity: 1 }] }, 'unknown_product'));

test('one unavailable product prevents creation of the entire checkout', () =>
  rejected({ items: [item(), { productId: 'cloud-desk-mat', quantity: 1 }] }, 'unavailable_product'));

test('duplicate product lines are rejected rather than bypassing quantity limits', () =>
  rejected({ items: [item(MAX_UNITS_PER_ITEM), item()] }, 'duplicate_product'));

test('the session receives an immutable snapshot independent of subsequent input edits', async () => {
  const payload = { items: [item()] };
  const pending = startCheckout(payload, new FakeSessionCreator());
  payload.items[0].quantity = 10;
  const { quote } = await pending;
  assert.equal(quote.lines[0].quantity, 1);
  assert.equal(quote.totalMinor, 795);
  assert.ok(Object.isFrozen(quote));
  assert.ok(Object.isFrozen(quote.lines));
  assert.ok(Object.isFrozen(quote.lines[0]));
  assert.throws(() => { quote.lines[0].unitPriceMinor = 1; }, TypeError);
});

test('a fake session failure propagates without retrying or reporting success', async () => {
  let calls = 0;
  const sessions = { async create() { calls++; throw new Error('Simulated session failure'); } };
  await assert.rejects(startCheckout({ items: [item()] }, sessions), /Simulated session failure/);
  assert.equal(calls, 1);
});

test('sparse arrays cannot bypass item validation and create a zero-price session', () =>
  rejected({ items: new Array(1) }, 'invalid_item'));
