import { describe, it, expect } from 'vitest';
import { ProductList } from 'src/entities/product-list.entity';

describe('ProductList Entity', () => {
  it('should be defined', () => {
    const productList = new ProductList();
    expect(productList).toBeDefined();
  });

  it('should be instance of ProductList', () => {
    const productList = new ProductList();
    expect(productList).toBeInstanceOf(ProductList);
  });
});
