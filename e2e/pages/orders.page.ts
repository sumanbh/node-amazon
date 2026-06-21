import { Page, Locator, expect } from '@playwright/test';

export class OrdersPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly orderCards: Locator;
  readonly noOrdersMsg: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h2.orders-title');
    this.orderCards = page.locator('.orders-container .card');
    this.noOrdersMsg = page.locator('h5:has-text("You have no orders yet")');
  }

  async verifyOrderExists() {
    await expect(this.orderCards.first()).toBeVisible();
  }

  async getOrderCount(): Promise<number> {
    return await this.orderCards.count();
  }

  async getLatestOrderTotal(): Promise<string> {
    // The first card is the most recent order
    const totalElem = this.orderCards.first().locator('.total-container .child-one');
    return (await totalElem.textContent())?.trim() ?? '';
  }

  async verifyOrderContainsProduct(productName: string) {
    const productLink = this.page.locator('.card-body .name-container a', { hasText: productName });
    await expect(productLink.first()).toBeVisible();
  }
}
