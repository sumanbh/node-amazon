import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartTitle: Locator;
  readonly cartItems: Locator;
  readonly subtotalText: Locator;
  readonly proceedButton: Locator;
  readonly emptyCartMsg: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartTitle = page.locator('h2.cart-title');
    // Using .row.is-flex to match cart item containers
    this.cartItems = page.locator('.cart-container .is-flex');
    this.subtotalText = page.locator('.checkout-subtotal .cart-product-price');
    this.proceedButton = page.locator('button:has-text("Proceed to Checkout")');
    this.emptyCartMsg = page.locator('h2:has-text("Your cart is empty")');
  }

  async getItemCount(): Promise<number> {
    return await this.page.locator('button.cart-remove').count();
  }

  async deleteItem(index: number) {
    const deleteBtn = this.page.locator('button.cart-remove').nth(index);
    await deleteBtn.click();
  }

  async getSubtotal(): Promise<string> {
    return (await this.subtotalText.textContent())?.trim() ?? '';
  }

  async verifyEmptyCart() {
    await expect(this.emptyCartMsg).toBeVisible();
    await expect(this.proceedButton).toBeDisabled();
  }

  async proceedToCheckout() {
    await this.proceedButton.click();
  }
}
