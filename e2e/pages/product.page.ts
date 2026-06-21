import { Page, Locator, expect } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly quantityInput: Locator;
  readonly addToCartBtn: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productName = page.locator('h1');
    this.productPrice = page.locator('.product-price');
    this.quantityInput = page.locator('input#quantity');
    this.addToCartBtn = page.locator('.cart-container button');
    this.successToast = page.locator('.simple-notification');
  }

  async getProductName(): Promise<string> {
    await this.productName.waitFor({ state: 'visible' });
    return (await this.productName.textContent())?.trim() ?? '';
  }

  async getPrice(): Promise<string> {
    await this.productPrice.waitFor({ state: 'visible' });
    return (await this.productPrice.textContent())?.trim() ?? '';
  }

  async setQuantity(qty: number) {
    await this.quantityInput.clear();
    await this.quantityInput.fill(qty.toString());
  }

  async addToCart() {
    await this.addToCartBtn.click();
  }

  async waitForToast() {
    await expect(this.successToast).toBeVisible();
    await expect(this.successToast).toContainText('Added');
  }
}
