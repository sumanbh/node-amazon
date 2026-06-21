import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="pass"]');
    this.submitButton = page.locator('input[type="submit"].loginmodal-submit');
    this.errorAlert = page.locator('.alert.alert-danger.loginerr');
  }

  async login(email?: string, password?: string) {
    if (email !== undefined) {
      await this.emailInput.clear();
      await this.emailInput.fill(email);
    }
    if (password !== undefined) {
      await this.passwordInput.clear();
      await this.passwordInput.fill(password);
    }
    await this.submitButton.click();
  }

  async verifyOnLoginPage() {
    await expect(this.page).toHaveURL(/\/demo\/login/);
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }
}
