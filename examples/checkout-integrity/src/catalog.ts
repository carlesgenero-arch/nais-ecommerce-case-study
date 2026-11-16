/** Fictional server-owned data, not a client-supplied price list. */
interface Product {
  readonly id: string;
  readonly name: string;
  readonly priceMinor: number;
  readonly available: boolean;
}

export const CURRENCY = 'USD' as const;

const products: ReadonlyMap<string, Readonly<Product>> = new Map<string, Readonly<Product>>([
  ['orbit-notebook', Object.freeze({
    id: 'orbit-notebook', name: 'Orbit Notebook', priceMinor: 795, available: true,
  })],
  ['cedar-pencil-set', Object.freeze({
    id: 'cedar-pencil-set', name: 'Cedar Pencil Set', priceMinor: 425, available: true,
  })],
  ['cloud-desk-mat', Object.freeze({
    id: 'cloud-desk-mat', name: 'Cloud Desk Mat', priceMinor: 1875, available: false,
  })],
]);

export function findProduct(id: string): Readonly<Product> | undefined {
  return products.get(id);
}
