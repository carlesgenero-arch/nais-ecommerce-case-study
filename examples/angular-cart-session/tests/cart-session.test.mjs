import assert from 'node:assert/strict';
import test from 'node:test';
import { CartSession } from '../dist/cart-session.js';

// Fictional stationery products and synthetic session identifiers only.
test('signals reflect adding, updating and removing items without mutating snapshots', () => {
  const cart = new CartSession();
  cart.add('pencil-kit', 2);
  const original = cart.snapshot();
  cart.add('canvas-pouch');
  cart.setQuantity('pencil-kit', 3);
  assert.equal(cart.totalUnits(), 4);
  cart.remove('canvas-pouch');
  assert.deepEqual(cart.snapshot().lines, [{ productId: 'pencil-kit', quantity: 3 }]);
  assert.equal(cart.totalUnits(), 3);
  assert.deepEqual(original.lines, [{ productId: 'pencil-kit', quantity: 2 }]);
  assert.ok(Object.isFrozen(original));
  assert.ok(Object.isFrozen(original.lines));
  assert.ok(Object.isFrozen(original.lines[0]));
  assert.throws(() => { original.lines[0].quantity = 99; }, TypeError);
});

test('a paid result clears only the cart associated with its session, once', () => {
  const cart = new CartSession();
  cart.add('pencil-kit');
  const attempt = cart.beginCheckout();
  assert.equal(cart.attachSession(attempt, 'example-session-current'), true);
  assert.equal(cart.applyPaymentResult({ sessionId: 'example-session-current', status: 'paid' }), true);
  assert.equal(cart.totalUnits(), 0);
  assert.equal(cart.applyPaymentResult({ sessionId: 'example-session-current', status: 'paid' }), false);
});

test('regression: an older paid confirmation cannot clear a newer cart or its checkout', () => {
  const cart = new CartSession();
  cart.add('pencil-kit');
  const oldAttempt = cart.beginCheckout();
  cart.attachSession(oldAttempt, 'example-session-old');

  cart.remove('pencil-kit');
  cart.add('canvas-pouch', 2);
  const currentAttempt = cart.beginCheckout();
  cart.attachSession(currentAttempt, 'example-session-new');
  const selection = cart.snapshot();

  assert.equal(cart.applyPaymentResult({ sessionId: 'example-session-old', status: 'paid' }), false);
  assert.equal(cart.snapshot(), selection);
  assert.equal(cart.applyPaymentResult({ sessionId: 'example-session-new', status: 'paid' }), true);
});

test('removing and re-adding identical contents does not revive an old correlation', () => {
  const cart = new CartSession();
  cart.add('pencil-kit');
  const attempt = cart.beginCheckout();
  cart.attachSession(attempt, 'example-session-original');
  cart.remove('pencil-kit');
  cart.add('pencil-kit');
  assert.deepEqual(cart.snapshot().lines, attempt.snapshot.lines);
  assert.notEqual(cart.snapshot().revision, attempt.snapshot.revision);
  assert.equal(cart.applyPaymentResult({ sessionId: 'example-session-original', status: 'paid' }), false);
  assert.equal(cart.totalUnits(), 1);
});

test('a late session-creation response cannot attach to an edited cart', () => {
  const cart = new CartSession();
  cart.add('pencil-kit');
  const attempt = cart.beginCheckout();
  cart.setQuantity('pencil-kit', 2);
  assert.equal(cart.attachSession(attempt, 'example-session-late'), false);
  assert.equal(cart.applyPaymentResult({ sessionId: 'example-session-late', status: 'paid' }), false);
  assert.equal(cart.totalUnits(), 2);
});

test('the newest checkout attempt wins even when the cart has not changed', () => {
  const cart = new CartSession();
  cart.add('pencil-kit');
  const first = cart.beginCheckout();
  const second = cart.beginCheckout();
  assert.equal(cart.attachSession(first, 'example-session-superseded'), false);
  assert.equal(cart.attachSession(second, 'example-session-latest'), true);
  assert.equal(cart.applyPaymentResult({ sessionId: 'example-session-superseded', status: 'paid' }), false);
  assert.equal(cart.applyPaymentResult({ sessionId: 'example-session-latest', status: 'paid' }), true);
});

test('missing correlation, an unpaid result and a mismatched session preserve the cart', () => {
  const cart = new CartSession();
  cart.add('canvas-pouch');
  const selection = cart.snapshot();
  assert.equal(cart.applyPaymentResult({ sessionId: 'example-session-unrelated', status: 'paid' }), false);
  const attempt = cart.beginCheckout();
  assert.equal(cart.attachSession(attempt, 'example-session-known'), true);
  assert.equal(cart.attachSession(attempt, 'example-session-replacement'), false);
  assert.equal(cart.applyPaymentResult({ sessionId: 'example-session-known', status: 'unpaid' }), false);
  assert.equal(cart.applyPaymentResult({ sessionId: 'example-session-other', status: 'paid' }), false);
  assert.equal(cart.snapshot(), selection);
});

test('invalid quantities and empty checkout are rejected without changing state', () => {
  const cart = new CartSession();
  assert.throws(() => cart.beginCheckout());
  cart.add('pencil-kit', 2);
  const selection = cart.snapshot();
  for (const quantity of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => cart.setQuantity('pencil-kit', quantity), RangeError);
  }
  assert.throws(() => cart.add('   '), TypeError);
  assert.equal(cart.snapshot(), selection);
});
