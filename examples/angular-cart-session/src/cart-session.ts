import { computed, signal } from '@angular/core';

export interface Line {
  readonly productId: string;
  readonly quantity: number;
}

export interface Snapshot {
  readonly revision: number;
  readonly lines: readonly Readonly<Line>[];
}

export interface CheckoutAttempt {
  readonly snapshot: Snapshot;
}

export interface PaymentResult {
  readonly sessionId: string;
  readonly status: 'paid' | 'unpaid';
}

function immutableSnapshot(revision: number, lines: readonly Line[]): Snapshot {
  const copies = lines.map(line => Object.freeze({ ...line }));
  return Object.freeze({ revision, lines: Object.freeze(copies) });
}

/** Educational, in-memory store. Payment verification belongs to a trusted backend. */
export class CartSession {
  private readonly state = signal<Snapshot>(immutableSnapshot(0, []));
  private pending: { attempt: CheckoutAttempt; sessionId: string | null } | null = null;

  readonly snapshot = this.state.asReadonly();
  readonly totalUnits = computed(() =>
    this.state().lines.reduce((total, line) => total + line.quantity, 0));

  add(productId: string, quantity = 1): void {
    if (!productId.trim()) throw new TypeError('A product identifier is required.');
    const existing = this.state().lines.find(line => line.productId === productId);
    this.setQuantity(productId, (existing?.quantity ?? 0) + this.validQuantity(quantity));
  }

  setQuantity(productId: string, quantity: number): void {
    if (!productId.trim()) throw new TypeError('A product identifier is required.');
    this.validQuantity(quantity);
    const lines = this.state().lines;
    const existing = lines.find(line => line.productId === productId);
    if (existing?.quantity === quantity) return;
    this.commit(existing
      ? lines.map(line => line.productId === productId ? { productId, quantity } : line)
      : [...lines, { productId, quantity }]);
  }

  remove(productId: string): void {
    const remaining = this.state().lines.filter(line => line.productId !== productId);
    if (remaining.length !== this.state().lines.length) this.commit(remaining);
  }

  /** Capture before requesting a session; a second attempt supersedes the first. */
  beginCheckout(): CheckoutAttempt {
    if (!this.state().lines.length) throw new Error('An empty cart cannot start checkout.');
    const attempt = Object.freeze({ snapshot: this.state() });
    this.pending = { attempt, sessionId: null };
    return attempt;
  }

  /** Attach the returned session to its original attempt, never to today's cart. */
  attachSession(attempt: CheckoutAttempt, sessionId: string): boolean {
    if (!sessionId.trim() || this.pending?.attempt !== attempt
      || this.state() !== attempt.snapshot || this.pending.sessionId !== null) return false;
    this.pending = { attempt, sessionId };
    return true;
  }

  /** Call only with a trusted backend result; this example does not verify payments. */
  applyPaymentResult(result: PaymentResult): boolean {
    const pending = this.pending;
    if (result.status !== 'paid' || !pending || pending.sessionId === null
      || result.sessionId !== pending.sessionId
      || this.state() !== pending.attempt.snapshot) return false;
    this.commit([]);
    return true;
  }

  private commit(lines: readonly Line[]): void {
    this.pending = null;
    this.state.set(immutableSnapshot(this.state().revision + 1, lines));
  }

  private validQuantity(quantity: number): number {
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      throw new RangeError('Quantity must be a positive safe integer.');
    }
    return quantity;
  }
}
