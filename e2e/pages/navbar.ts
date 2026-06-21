import { Page, Locator, expect } from '@playwright/test';

export class Navbar {
  readonly page: Page;
  readonly cartSizeBadge: Locator;
  readonly cartLink: Locator;
  readonly loginButton: Locator;
  readonly userWelcomeDropdown: Locator;
  readonly signOutButton: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartSizeBadge = page.locator('#cart-size');
    this.cartLink = page.locator('#user-cart');
    this.loginButton = page.locator('#login-io');
    this.userWelcomeDropdown = page.locator('.user-welcome');
    this.signOutButton = page.locator('.dropdown-menu button:has-text("Sign Out")');
    this.searchInput = page.locator('#search-bar');
    this.searchButton = page.locator('#search-button');
  }

  async getCartCount(): Promise<string> {
    return (await this.cartSizeBadge.textContent())?.trim() ?? '';
  }

  async verifyCartCount(count: number) {
    await expect(this.cartSizeBadge).toHaveText(count.toString());
  }

  async verifyLoggedIn(givenName: string) {
    await expect(this.userWelcomeDropdown).toBeVisible();
    await expect(this.userWelcomeDropdown).toContainText(`Hello, ${givenName}`);
  }

  async verifyLoggedOut() {
    await expect(this.loginButton).toBeVisible();
    await expect(this.userWelcomeDropdown).not.toBeVisible();
  }

  async clickCart() {
    await this.cartLink.click();
  }

  async signOut() {
    await this.userWelcomeDropdown.click();
    await this.signOutButton.click();
  }
}
