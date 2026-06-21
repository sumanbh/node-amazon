import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipInput: Locator;
  readonly placeOrderBtn: Locator;
  readonly reviewItemsHeader: Locator;
  readonly orderTotalText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.locator('input#userName');
    this.addressInput = page.locator('input#userAddress');
    this.cityInput = page.locator('input#userCity');
    this.stateInput = page.locator('input#userState');
    this.zipInput = page.locator('input#userZip');
    this.placeOrderBtn = page.locator('button#submit-label');
    this.reviewItemsHeader = page.locator('h2:has-text("Review Items")');
    this.orderTotalText = page.locator('.checkout-subtotal .cart-product-price');
  }

  async verifyPrefilledName(expectedName: string) {
    await expect(this.fullNameInput).toHaveValue(expectedName);
  }

  async fillShippingInfo(info: { address: string, city: string, state: string, zip: string }) {
    await this.addressInput.fill(info.address);
    await this.cityInput.fill(info.city);
    await this.stateInput.fill(info.state);
    await this.zipInput.fill(info.zip);
  }

  async placeOrder() {
    await this.placeOrderBtn.click();
  }

  async getOrderTotal(): Promise<string> {
    return (await this.orderTotalText.textContent())?.trim() ?? '';
  }
}
