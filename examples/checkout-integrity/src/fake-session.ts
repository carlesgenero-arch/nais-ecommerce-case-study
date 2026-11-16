import type { CheckoutSession, Quote, SessionCreator } from './checkout.js';

/** A local fake, not a payment provider or evidence that money has moved. */
export class FakeSessionCreator implements SessionCreator {
  private readonly history: Quote[] = [];

  get requests(): readonly Quote[] {
    return [...this.history];
  }

  async create(quote: Quote): Promise<CheckoutSession> {
    this.history.push(quote);
    return Object.freeze({ id: 'fictional-session-' + this.history.length, quote });
  }
}
