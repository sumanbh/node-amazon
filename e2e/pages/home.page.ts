import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly productCards: Locator;
  readonly firstProductLink: Locator;
  readonly lowPriceInput: Locator;
  readonly highPriceInput: Locator;
  readonly customPriceGoBtn: Locator;
  readonly clearPriceBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCards = page.locator('#products .boxception');
    this.firstProductLink = page.locator('#products .boxception:nth-child(1) > a.main-content-name');
    this.lowPriceInput = page.locator('#low-price');
    this.highPriceInput = page.locator('#high-price');
    this.customPriceGoBtn = page.locator('#custom-label');
    this.clearPriceBtn = page.locator('button#allprices');
  }

  async navigate() {
    await this.page.goto('/demo/');
  }

  async getProductCount(): Promise<number> {
    await this.productCards.first().waitFor({ state: 'visible' });
    return await this.productCards.count();
  }

  async getFirstProductName(): Promise<string> {
    await this.firstProductLink.waitFor({ state: 'visible' });
    return (await this.firstProductLink.textContent())?.trim() ?? '';
  }

  async clickProduct(index: number) {
    // index is 0-based
    const productLink = this.page.locator(`#products .boxception:nth-child(${index + 1}) > a.main-content-name`);
    await productLink.click();
  }

  private async performFilterAction(action: () => Promise<void>) {
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes('/api/shop/') && response.status() === 200
    );
    await action();
    await responsePromise;
  }

  async filterByBrand(brand: string) {
    await this.performFilterAction(async () => {
      const element = this.page.locator(`input[id="${brand}"]`);
      if (!(await element.isChecked())) {
        await element.dispatchEvent('click');
      }
    });
  }

  async clearBrandFilter(brand: string) {
    await this.performFilterAction(async () => {
      const element = this.page.locator(`input[id="${brand}"]`);
      if (await element.isChecked()) {
        await element.dispatchEvent('click');
      }
    });
  }

  async filterByOS(os: string) {
    await this.performFilterAction(async () => {
      const element = this.page.locator(`input[id="${os}"]`);
      if (!(await element.isChecked())) {
        await element.dispatchEvent('click');
      }
    });
  }

  async clearOSFilter(os: string) {
    await this.performFilterAction(async () => {
      const element = this.page.locator(`input[id="${os}"]`);
      if (await element.isChecked()) {
        await element.dispatchEvent('click');
      }
    });
  }

  async filterByPriceRadio(priceLabel: string) {
    await this.performFilterAction(async () => {
      await this.page.locator(`input[id="${priceLabel}"]`).dispatchEvent('click');
    });
  }

  async clearPriceFilter() {
    await this.performFilterAction(async () => {
      await this.clearPriceBtn.dispatchEvent('click');
    });
  }

  async filterByCustomPrice(min: number, max: number) {
    await this.lowPriceInput.fill(min.toString());
    await this.highPriceInput.fill(max.toString());
    await this.performFilterAction(async () => {
      await this.customPriceGoBtn.dispatchEvent('click');
    });
  }

  async clearCustomPrice() {
    await this.performFilterAction(async () => {
      await this.clearPriceBtn.dispatchEvent('click');
    });
  }

  async filterByRAM(ram: string) {
    await this.performFilterAction(async () => {
      const element = this.page.locator(`input[id="${ram}"]`);
      if (!(await element.isChecked())) {
        await element.dispatchEvent('click');
      }
    });
  }

  async clearRAMFilter(ram: string) {
    await this.performFilterAction(async () => {
      const element = this.page.locator(`input[id="${ram}"]`);
      if (await element.isChecked()) {
        await element.dispatchEvent('click');
      }
    });
  }

  async filterByProcessor(processor: string) {
    await this.performFilterAction(async () => {
      const element = this.page.locator(`input[id="${processor}"]`);
      if (!(await element.isChecked())) {
        await element.dispatchEvent('click');
      }
    });
  }

  async clearProcessorFilter(processor: string) {
    await this.performFilterAction(async () => {
      const element = this.page.locator(`input[id="${processor}"]`);
      if (await element.isChecked()) {
        await element.dispatchEvent('click');
      }
    });
  }

  async filterByStorage(storageType: string) {
    await this.performFilterAction(async () => {
      const element = this.page.locator(`input[id="${storageType}"]`);
      if (!(await element.isChecked())) {
        await element.dispatchEvent('click');
      }
    });
  }

  async clearStorageFilter(storageType: string) {
    await this.performFilterAction(async () => {
      const element = this.page.locator(`input[id="${storageType}"]`);
      if (await element.isChecked()) {
        await element.dispatchEvent('click');
      }
    });
  }

  async navigateToPage(pageNumber: number) {
    const pageLink = this.page.locator(`pagination-controls a`, { hasText: pageNumber.toString() });
    await this.performFilterAction(async () => {
      await pageLink.click();
    });
  }
}
