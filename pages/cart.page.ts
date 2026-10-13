// ABOUTME: Page object for the shopping cart page at /view_cart.
// ABOUTME: Provides methods to inspect cart items, remove products, and proceed to checkout.

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export interface CartItem {
  name: string;
  price: string;
  quantity: string;
  total: string;
}

export class CartPage extends BasePage {
  private readonly cartRows: Locator;
  private readonly emptyCartMessage: Locator;
  private readonly proceedToCheckoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartRows = page.locator('#cart_info_table tbody tr');
    this.emptyCartMessage = page.locator('#empty_cart');
    this.proceedToCheckoutButton = page.locator('.check_out');
  }

  async open(): Promise<void> {
    await this.navigate('/view_cart');
  }

  async getCartItemCount(): Promise<number> {
    return this.cartRows.count();
  }

  async verifyCartItemCount(expected: number): Promise<void> {
    await expect(this.cartRows).toHaveCount(expected);
  }

  async getCartItems(): Promise<CartItem[]> {
    const items: CartItem[] = [];
    const count = await this.cartRows.count();
    for (let i = 0; i < count; i++) {
      const row = this.cartRows.nth(i);
      items.push({
        name:
          (await row.locator('.cart_description h4 a').textContent()) ?? '',
        price: (await row.locator('.cart_price p').textContent()) ?? '',
        quantity:
          (await row.locator('.cart_quantity button').textContent()) ?? '',
        total: (await row.locator('.cart_total p').textContent()) ?? '',
      });
    }
    return items;
  }

  async removeItem(index: number): Promise<void> {
    await this.cartRows
      .nth(index)
      .locator('.cart_quantity_delete a')
      .click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
  }

  async verifyCartIsEmpty(): Promise<void> {
    await expect(this.emptyCartMessage).toBeVisible();
  }

  async verifyItemInCart(productName: string): Promise<void> {
    await expect(
      this.page.locator(`#cart_info_table td:has-text("${productName}")`)
    ).toBeVisible();
  }

  async registerLoginFromCartModal(): Promise<void> {
    await this.page.locator('#checkoutModal a[href="/login"]').click();
  }
}
