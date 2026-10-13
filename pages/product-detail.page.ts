// ABOUTME: Page object for individual product detail pages.
// ABOUTME: Provides methods to read product information, set quantity, and add to cart.

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export interface ProductInfo {
  name: string;
  category: string;
  price: string;
  availability: string;
  condition: string;
  brand: string;
}

export class ProductDetailPage extends BasePage {
  private readonly productName: Locator;
  private readonly productCategory: Locator;
  private readonly productPrice: Locator;
  private readonly productAvailability: Locator;
  private readonly productCondition: Locator;
  private readonly productBrand: Locator;
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.locator('.product-information h2');
    this.productCategory = page.locator(
      '.product-information p:first-of-type'
    );
    this.productPrice = page.locator('.product-information span span');
    this.productAvailability = page.locator(
      '.product-information p:has(b:has-text("Availability"))'
    );
    this.productCondition = page.locator(
      '.product-information p:has(b:has-text("Condition"))'
    );
    this.productBrand = page.locator(
      '.product-information p:has(b:has-text("Brand"))'
    );
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = page.locator('button:has-text("Add to cart")');
  }

  async getProductInfo(): Promise<ProductInfo> {
    return {
      name: await this.getText(this.productName),
      category: await this.getText(this.productCategory),
      price: await this.getText(this.productPrice),
      availability: await this.getText(this.productAvailability),
      condition: await this.getText(this.productCondition),
      brand: await this.getText(this.productBrand),
    };
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.clear();
    await this.quantityInput.fill(quantity.toString());
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.page.locator('button:has-text("Continue Shopping")').click();
  }

  async viewCartFromModal(): Promise<void> {
    await this.page
      .locator('#cartModal a:has-text("View Cart")')
      .click();
  }
}
