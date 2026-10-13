// ABOUTME: Data-driven tests for product search functionality.
// ABOUTME: Validates search results across multiple search terms loaded from external test data.

import { test, expect } from '../fixtures/test-fixtures';
import { getProducts } from '../utils/data-reader';

const productData = getProducts();

test.describe('Product Search - Data Driven', () => {
  for (const searchTerm of productData.searchTerms) {
    test(`Search for "${searchTerm}" returns relevant results`, async ({
      productsPage,
    }) => {
      await productsPage.open();
      await productsPage.verifyProductsPageVisible();

      await productsPage.searchProduct(searchTerm);
      await productsPage.verifySearchResults();

      const count = await productsPage.getProductCount();
      expect(count).toBeGreaterThan(0);

      const names = await productsPage.getProductNames();
      const hasRelevantResult = names.some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(hasRelevantResult).toBe(true);
    });
  }

  test('View product details from listing', async ({
    productsPage,
    productDetailPage,
  }) => {
    await productsPage.open();
    await productsPage.viewProductDetails(0);

    const info = await productDetailPage.getProductInfo();
    expect(info.name).toBeTruthy();
    expect(info.price).toBeTruthy();
    expect(info.availability).toBeTruthy();
  });

  test('All products page shows product list', async ({ productsPage }) => {
    await productsPage.open();
    await productsPage.verifyProductsPageVisible();

    const count = await productsPage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });
});
