// ABOUTME: Page object for the checkout and payment flow.
// ABOUTME: Handles address verification, order review, comment entry, payment, and confirmation.

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  private readonly deliveryAddress: Locator;
  private readonly billingAddress: Locator;
  private readonly orderComment: Locator;
  private readonly placeOrderButton: Locator;
  private readonly orderItems: Locator;
  private readonly nameOnCard: Locator;
  private readonly cardNumber: Locator;
  private readonly cvc: Locator;
  private readonly expiryMonth: Locator;
  private readonly expiryYear: Locator;
  private readonly payButton: Locator;
  private readonly orderConfirmationMessage: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.orderComment = page.locator('textarea[name="message"]');
    this.placeOrderButton = page.locator('a:has-text("Place Order")');
    this.orderItems = page.locator('#cart_info tbody tr');

    this.nameOnCard = page.locator('[data-qa="name-on-card"]');
    this.cardNumber = page.locator('[data-qa="card-number"]');
    this.cvc = page.locator('[data-qa="cvc"]');
    this.expiryMonth = page.locator('[data-qa="expiry-month"]');
    this.expiryYear = page.locator('[data-qa="expiry-year"]');
    this.payButton = page.locator('[data-qa="pay-button"]');

    this.orderConfirmationMessage = page.locator(
      'p:has-text("Congratulations! Your order has been confirmed!")'
    );
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async verifyDeliveryAddress(expectedText: string): Promise<void> {
    await expect(this.deliveryAddress).toContainText(expectedText);
  }

  async verifyBillingAddress(expectedText: string): Promise<void> {
    await expect(this.billingAddress).toContainText(expectedText);
  }

  async addComment(comment: string): Promise<void> {
    await this.orderComment.fill(comment);
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }

  async fillPaymentDetails(payment: {
    nameOnCard: string;
    cardNumber: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
  }): Promise<void> {
    await this.nameOnCard.fill(payment.nameOnCard);
    await this.cardNumber.fill(payment.cardNumber);
    await this.cvc.fill(payment.cvc);
    await this.expiryMonth.fill(payment.expiryMonth);
    await this.expiryYear.fill(payment.expiryYear);
  }

  async confirmPayment(): Promise<void> {
    await this.payButton.click();
  }

  async verifyOrderPlaced(): Promise<void> {
    await expect(this.orderConfirmationMessage).toBeVisible();
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  async getOrderItemCount(): Promise<number> {
    return this.orderItems.count();
  }
}
