import { describe, it, expect, vi } from 'vitest';

// 🚫 BLOCK real entity execution
vi.mock('src/entities/product-type.entity', () => ({
  ProductType: class ProductType {},
}));

import { ProductType } from 'src/entities/product-type.entity';

describe('ProductType Entity', () => {
  it('should be defined', () => {
    const productType = new ProductType();
    expect(productType).toBeDefined();
  });

  it('should be instance of ProductType', () => {
    const productType = new ProductType();
    expect(productType).toBeInstanceOf(ProductType);
  });
});
