import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home.page';

test.describe('Home Page Scenario', () => {
  test('should verify home page filters and pagination', async ({ page }) => {
    const homePage = new HomePage(page);

    // --- Step 4.1: Verify Home Page & All Filters ---
    await homePage.navigate();
    await expect(page).toHaveTitle(/Node Amazon: Laptops/);

    const initialProductCount = await homePage.getProductCount();
    expect(initialProductCount).toBeGreaterThan(0);

    // 2. Featured Brands filter
    await homePage.filterByBrand('Apple');
    await expect(page).toHaveURL(/.*brand=apple.*/);
    const appleCount = await homePage.getProductCount();
    expect(appleCount).toBeGreaterThan(0);
    await homePage.clearBrandFilter('Apple');

    // 3. Operating System filter
    await homePage.filterByOS('Mac OS X');
    await expect(page).toHaveURL(/.*os=mac%20os%20x.*/);
    const osCount = await homePage.getProductCount();
    expect(osCount).toBeGreaterThan(0);
    await homePage.clearOSFilter('Mac OS X');

    // 4. Price radio filter
    await homePage.filterByPriceRadio('Under $500');
    await expect(page).toHaveURL(/.*min=0&max=500.*/);
    const priceCount = await homePage.getProductCount();
    expect(priceCount).toBeGreaterThan(0);
    await homePage.clearPriceFilter();

    // 5. Custom Price filter
    await homePage.filterByCustomPrice(800, 1200);
    await expect(page).toHaveURL(/.*min=800&max=1200.*/);
    await expect(homePage.clearPriceBtn).toBeVisible();
    await homePage.clearCustomPrice();

    // 6. RAM Size filter
    await homePage.filterByRAM('16');
    await expect(page).toHaveURL(/.*ram=16.*/);
    const ramCount = await homePage.getProductCount();
    expect(ramCount).toBeGreaterThan(0);
    await homePage.clearRAMFilter('16');

    // 7. Processor Type filter
    await homePage.filterByProcessor('Intel Core i7');
    await expect(page).toHaveURL(/.*processor=intel%20core%20i7.*/);
    const processorCount = await homePage.getProductCount();
    expect(processorCount).toBeGreaterThan(0);
    await homePage.clearProcessorFilter('Intel Core i7');

    // 8. Hard Drive Type filter
    await homePage.filterByStorage('SSD');
    await expect(page).toHaveURL(/.*storage=ssd.*/);
    const storageCount = await homePage.getProductCount();
    expect(storageCount).toBeGreaterThan(0);
    await homePage.clearStorageFilter('SSD');

    // --- Step 4.2: Pagination ---
    const page1FirstName = await homePage.getFirstProductName();
    await homePage.navigateToPage(2);
    await expect(page).toHaveURL(/.*page=2.*/);
    const page2FirstName = await homePage.getFirstProductName();
    expect(page1FirstName).not.toEqual(page2FirstName);
  });
});
