// ABOUTME: Page object for the products listing page with search and add-to-cart capabilities.
// ABOUTME: Provides methods for searching products, viewing the list, and adding items to cart.

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductsPage extends BasePage {
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly productCards: Locator;
  private readonly searchedProductsTitle: Locator;
  private readonly allProductsTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.productCards = page.locator('.features_items .col-sm-4');
    this.searchedProductsTitle = page.locator(
      'h2:has-text("Searched Products")'
    );
    this.allProductsTitle = page.locator('h2:has-text("All Products")');
  }

  async open(): Promise<void> {
    await this.navigate('/products');
  }

  async verifyProductsPageVisible(): Promise<void> {
    await expect(this.allProductsTitle).toBeVisible();
  }

  async searchProduct(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async verifySearchResults(): Promise<void> {
    await expect(this.searchedProductsTitle).toBeVisible();
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async getProductNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.productCards.count();
    for (let i = 0; i < count; i++) {
      const name = await this.productCards
        .nth(i)
        .locator('.productinfo p')
        .textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  async addProductToCart(index: number): Promise<void> {
    const product = this.productCards.nth(index);
    await product.hover();
    await product.locator('.overlay-content .add-to-cart').click();
  }

  async continueShopping(): Promise<void> {
    await this.page.locator('button:has-text("Continue Shopping")').click();
  }

  async viewCartFromModal(): Promise<void> {
    await this.page
      .locator('#cartModal a:has-text("View Cart")')
      .click();
  }

  async viewProductDetails(index: number): Promise<void> {
    await this.productCards
      .nth(index)
      .locator('a:has-text("View Product")')
      .click();
  }
}
